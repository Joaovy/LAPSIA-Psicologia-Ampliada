async function fetchDiretorias(){
  LAPSIA_DB.diretorias.forEach(d => {
    d.candidatosInscritos = d._candidatosInscritosExemplo.map(c => ({...c, diretoriaId:d.id, diretoriaNome:d.nome, ...getOverlaySeeded(c)}));
  });
  return LAPSIA_DB.diretorias;
}
async function fetchDiretoria(id){
  const diretorias = await fetchDiretorias();
  return diretorias.find(d => d.id === id) || null;
}
function fetchNucleos(){
  // TODO(integração): trocar por fetch('.../exec?api=1&fn=getNucleos')
  return Promise.resolve(LAPSIA_DB.nucleos);
}
function fetchNucleo(id){
  return Promise.resolve(LAPSIA_DB.nucleos.find(n => n.id === id) || null);
}
function fetchLigaAmpliada(){
  return Promise.resolve(LAPSIA_DB.ligaAmpliada);
}
// Carga horária certificada de cada trilha (núcleo ou Liga Ampliada) — lida direto do cadastro
// do núcleo/liga (campo cargaHoraria), pra nunca duplicar esse número em outro lugar.
function cargaHorariaPorOpcao(opcao){
  if(opcao === LAPSIA_DB.ligaAmpliada.nome) return LAPSIA_DB.ligaAmpliada.cargaHoraria;
  const n = LAPSIA_DB.nucleos.find(x => x.nome === opcao);
  return n ? n.cargaHoraria : null;
}
async function fetchCuradoria(){
  const { data, error } = await sb
    .from('inscricoes')
    .select(`
      id, motivacao, data_inscricao, nucleo_id,
      pessoas (nome, email, telefone, turno, periodo),
      nucleos (nome)
    `)
    .eq('semestre', SELLIG_SEMESTRE)
    .in('tipo', ['ligante_nucleo', 'ligante_liga_ampliada'])
    .order('data_inscricao', { ascending: true });

  if(error){ console.error('fetchCuradoria:', error); return []; }

  const candidatos = (data || []).map(insc => {
    const c = {
      id:             insc.id,
      nome:           insc.pessoas?.nome  || "",
      email:          insc.pessoas?.email || "",
      telefone:       insc.pessoas?.telefone || "",
      turno:          insc.pessoas?.turno    || "",
      periodo:        insc.pessoas?.periodo  || "",
      opcao:          insc.nucleos?.nome     || "",
      dataInscricao:  insc.data_inscricao
                        ? new Date(insc.data_inscricao + 'T00:00:00').toLocaleDateString('pt-BR')
                        : "",
      motivacaoTexto: insc.motivacao || "",
    };
    return { ...c, ...getOverlay(c.email) };
  });
  candidatos.forEach(garantirAcompanhamentoFrequencia);
  return candidatos;
}
// A partir do momento que a pessoa passa em todo o processo de aprovação (rubrica aprovada
// direto para Liga Ampliada, ou rubrica + entrevista aprovada para núcleo), ela precisa
// aparecer na aba de Frequência para o acompanhamento de presença começar. Roda a cada
// fetchCuradoria() — idempotente (só adiciona se ainda não existir um registro para a pessoa).
function garantirAcompanhamentoFrequencia(c){
  const etapa = etapaProcessoLigante(c).etapa;
  if(etapa !== "aprovado_final_liga" && etapa !== "aprovado_final_nucleo") return;
  const jaExiste = LAPSIA_DB.certificados.some(x => x.email ? x.email === c.email : x.ligante === c.nome);
  if(jaExiste) return;
  LAPSIA_DB.certificados.push({
    ligante: c.nome,
    email: c.email,
    telefone: c.telefone,
    nucleo: c.opcao,
    turno: c.turno,
    frequencia: 0,
    // Frequência mínima unificada em 75% para núcleos e Liga Ampliada (Revisão 14, a pedido dela
    // — antes os núcleos usavam 80%). A carga horária, essa sim, continua diferente por trilha.
    minimo: 75,
    cargaHoraria: cargaHorariaPorOpcao(c.opcao),
    status: "aguardando",
    avisoCertificadoEnviado: false // controle manual dela ("já avisei essa pessoa"), não envia nada de verdade
  });
}
function salvarNotaCuradoria(email, criterio, valor){
  getOverlay(email).notas[criterio] = valor;
  return Promise.resolve({ok:true});
}
function salvarEticaCuradoria(email, valor){
  getOverlay(email).etica = valor;
  return Promise.resolve({ok:true});
}
function fetchCertificados(){
  // TODO(integração): trocar por fetch('.../exec?api=1&fn=getCertificados')
  return Promise.resolve(LAPSIA_DB.certificados);
}
// Só quem já bateu a frequência mínima (Revisão 14, a pedido dela: "só aparece quando atingir
// o mínimo" — enquanto isso, a pessoa continua sendo acompanhada normalmente em Frequência,
// só não aparece ainda na aba Certificados).
async function fetchCertificadosElegiveis(){
  const certs = await fetchCertificados();
  return certs.filter(c => c.frequencia >= c.minimo);
}
function gerarCertificado(ligante){
  // TODO(integração): trocar pela chamada real que gera/emite o certificado
  const c = LAPSIA_DB.certificados.find(x => x.ligante === ligante);
  if(c){ c.status = "emitido"; c.data = new Intl.DateTimeFormat('pt-BR').format(new Date()); }
  return Promise.resolve({ok:true});
}
async function fetchDashboardIndicadores(){
  const certs = await fetchCertificados();
  const elegiveis = await fetchCertificadosElegiveis();
  const ligantesAtivos = certs.length;
  const presencaMedia = certs.length ? Math.round(certs.reduce((s,c)=>s+c.frequencia,0)/certs.length) : 0;
  // Pendentes/emitidos contam só quem já é elegível ao certificado (frequência ≥ mínimo) — quem
  // ainda está abaixo do mínimo está sendo acompanhado em Frequência, mas ainda não é "um
  // certificado" de fato.
  const certificadosPendentes = elegiveis.filter(c=>c.status==="aguardando").length;
  const certificadosEmitidos = elegiveis.filter(c=>c.status==="emitido").length;
  const candidatosLigantes = LAPSIA_DB.candidatosCuradoria.length;
  const candidatosDiretores = LAPSIA_DB.diretorias.reduce((s,d)=>s+d._candidatosInscritosExemplo.length,0);
  return {
    ligantesAtivos,
    presencaMedia,
    certificadosPendentes,
    certificadosEmitidos,
    candidatosEmSelecao: candidatosLigantes + candidatosDiretores
  };
}
function fetchProximosEncontros(){
  return Promise.resolve(LAPSIA_DB.proximosEncontros);
}
function fetchCronogramaEncontros(){
  return Promise.resolve(LAPSIA_DB.cronogramaEncontros);
}
function agendarEntrevistaDiretoria(diretoriaId, email, valor){
  getOverlay(email).entrevista = valor || null;
  return Promise.resolve({ok:true});
}
function agendarEntrevistaLigante(email, valor){
  getOverlay(email).entrevista = valor || null;
  return Promise.resolve({ok:true});
}
function salvarObservacoesCuradoria(email, texto){
  getOverlay(email).observacoes = texto;
  return Promise.resolve({ok:true});
}
function handleCalendarUpload(key, inputEl){
  // TODO(integração): hoje só guarda o nome do arquivo em memória; troque por upload real
  // (Google Drive API, storage do backend, etc.) quando a fonte real estiver conectada.
  const file = inputEl.files && inputEl.files[0];
  LAPSIA_DB.calendariosReferencia[key] = file ? file.name : null;
  renderMain();
}
function salvarResultadoEntrevistaDiretoria(diretoriaId, email, valor){
  getOverlay(email).resultadoEntrevista = valor || null;
  return Promise.resolve({ok:true});
}
function salvarResultadoEntrevistaLigante(email, valor){
  getOverlay(email).resultadoEntrevista = valor || null;
  return Promise.resolve({ok:true});
}
function fetchFeedback(){
  // TODO(integração): trocar por fetch('.../exec?api=1&fn=getFeedback') — fonte real é
  // RAW_Form_Feedback_AAAA_S (por semestre) via IMPORTRANGE, sempre anônima por desenho.
  return Promise.resolve(LAPSIA_DB.feedbackRespostas);
}
function fetchChamada(){
  // TODO(integração): trocar pela lista real de presença por encontro (formulário/QR na entrada, etc.)
  return Promise.resolve(LAPSIA_DB.chamada);
}
function salvarPresencaChamada(index, presente){
  // TODO(integração): trocar por um POST real de presença
  const item = LAPSIA_DB.chamada[index];
  if(item) item.presente = presente;
  return Promise.resolve({ok:true});
}

