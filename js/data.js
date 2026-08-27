// Submódulos de navegação por diretoria — UI estática, alinhada aos IDs do schema.
// Administrativa e de Pessoas concentra todos os módulos operacionais do sistema.
const _SUBMODULOS = {
  'administrativa-pessoas': [
    {id:"selecao-diretores",  nome:"Seleção de Diretores", implementado:true},
    {id:"selecao-ligantes",   nome:"Seleção de Ligantes",  implementado:true},
    {id:"presenca",           nome:"Frequência",           implementado:true},
    {id:"certificados",       nome:"Certificados",         implementado:true},
    {id:"feedback",           nome:"Feedback",             implementado:true},
    {id:"agendamento-sala",   nome:"Agendamento de Sala",  implementado:true}
  ],
  'academica':         [{id:"cronograma", nome:"Cronograma", implementado:true}],
  'cientifica':        [],
  'eventos-comunicacao':[],
  'financeira':        []
};

async function fetchDiretorias(){
  const { data, error } = await sb
    .from('diretorias')
    .select('id, nome, objetivo, responsabilidades, entregas, criterios_permanencia')
    .eq('ativo', true)
    .order('nome');
  if(error){
    console.error('fetchDiretorias:', error);
    // fallback: mock local (usa _candidatosInscritosExemplo para preservar o estado original entre renders)
    LAPSIA_DB.diretorias.forEach(d => {
      const raw = d._candidatosInscritosExemplo || d.candidatosInscritos || [];
      d.candidatosInscritos = raw.map(c => ({...c, diretoriaId:d.id, diretoriaNome:d.nome, ...getOverlaySeeded(c)}));
    });
    return LAPSIA_DB.diretorias;
  }
  return (data || []).map(d => ({
    id:               d.id,
    nome:             d.nome,
    objetivo:         d.objetivo || "",
    responsabilidades:d.responsabilidades || [],
    entregas:         d.entregas || [],
    criterios:        d.criterios_permanencia || [],
    submodulos:       _SUBMODULOS[d.id] || [],
    candidatosInscritos: [] // diretores vêm de inscricoes WHERE tipo='diretor' (Passo D)
  }));
}
async function fetchDiretoria(id){
  const diretorias = await fetchDiretorias();
  return diretorias.find(d => d.id === id) || null;
}
async function fetchNucleos(){
  const { data, error } = await sb
    .from('nucleos')
    .select('id, nome, descricao, responsabilidades, criterios, carga_horaria, link_agendamento')
    .eq('tipo', 'nucleo')
    .eq('ativo', true)
    .order('nome');
  if(error){ console.error('fetchNucleos:', error); return LAPSIA_DB.nucleos; }
  const nucleos = (data || []).map(n => {
    const local = LAPSIA_DB.nucleos.find(m => m.id === n.id) || {};
    return {
      id:               n.id,
      nome:             n.nome,
      descricao:        n.descricao || "",
      responsabilidades:n.responsabilidades || [],
      criterios:        n.criterios || [],
      cargaHoraria:     n.carga_horaria || null,
      linkAgendamento:  n.link_agendamento || null,
      encontros:        local.encontros || [] // tabela encontros migrada futuramente
    };
  });
  LAPSIA_DB.nucleos = nucleos; // cache para cargaHorariaPorOpcao() e fetchNucleo()
  return nucleos;
}
function fetchNucleo(id){
  return Promise.resolve(LAPSIA_DB.nucleos.find(n => n.id === id) || null);
}
async function fetchLigaAmpliada(){
  const { data, error } = await sb
    .from('nucleos')
    .select('id, nome, descricao, responsabilidades, criterios, carga_horaria, link_agendamento')
    .eq('tipo', 'liga_ampliada')
    .eq('ativo', true)
    .single();
  if(error){ console.error('fetchLigaAmpliada:', error); return LAPSIA_DB.ligaAmpliada; }
  const liga = {
    id:               data.id,
    nome:             data.nome,
    descricao:        data.descricao || "",
    responsabilidades:data.responsabilidades || [],
    criterios:        data.criterios || [],
    cargaHoraria:     data.carga_horaria || null,
    linkAgendamento:  data.link_agendamento || null,
    encontros:        LAPSIA_DB.ligaAmpliada.encontros || []
  };
  LAPSIA_DB.ligaAmpliada = liga; // cache para cargaHorariaPorOpcao()
  return liga;
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
  // TODO(Passo D): contar de inscricoes WHERE tipo='diretor' AND semestre=SELDIR_SEMESTRE
  const candidatosDiretores = 0;
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

