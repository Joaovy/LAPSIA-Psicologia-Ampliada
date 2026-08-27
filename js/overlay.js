
// Normaliza telefone brasileiro para o formato que o wa.me espera (só dígitos, com DDI 55).
// A coluna de CPF nunca existe em nenhum objeto de candidato (dado sensível de verdade —
// documento único, risco de fraude/identidade). Telefone não é "dado sensível" no sentido
// técnico da LGPD (essa categoria é outra: saúde, biometria, orientação sexual, convicção
// religiosa/política etc.) e a própria LAPSIA já usa telefone normalmente para adicionar
// ligantes/diretores em grupos de WhatsApp — por isso ele é lido e usado normalmente.
function normalizarTelefoneBr(raw){
  const digitos = String(raw||"").replace(/\D/g,"");
  if(!digitos) return "";
  return digitos.startsWith("55") ? digitos : "55"+digitos;
}

// Overlay em memória para tudo que é anotação da curadoria (entrevista, resultado, notas,
// ética, observações) — como não há Apps Script para persistir, essas edições vivem só
// durante a sessão do navegador (documentado para ela: não sobrevivem a um F5).
const CURADORIA_OVERLAY = {};
function getOverlay(email){
  if(!CURADORIA_OVERLAY[email]){
    CURADORIA_OVERLAY[email] = {
      entrevista:null, resultadoEntrevista:null, observacoes:"", etica:"",
      notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null},
      notificado:{agendamento:false, devolutiva:false} // só controle manual dela ("já enviei essa mensagem"), não envia nada de verdade
    };
  }
  return CURADORIA_OVERLAY[email];
}
// Igual a getOverlay(), mas para o modo "Dados de exemplo": na primeira vez que um candidato de
// exemplo é acessado, semeia o overlay com os valores que já vêm prontos nos dados de exemplo
// (entrevista/resultado/notas/ética já preenchidos para alguns, propositalmente, pra dar pra ver
// o painel em diferentes etapas do fluxo) — depois disso, edições dela vão pro overlay normal.
function getOverlaySeeded(c){
  if(!CURADORIA_OVERLAY[c.email]){
    CURADORIA_OVERLAY[c.email] = {
      entrevista: c.entrevista||null,
      resultadoEntrevista: c.resultadoEntrevista||null,
      observacoes: c.observacoes||"",
      etica: c.etica||"",
      notas: c.notas ? {...c.notas} : {motivacao:null, interesse:null, comprometimento:null, contribuicao:null},
      notificado:{agendamento:false, devolutiva:false}
    };
  }
  return CURADORIA_OVERLAY[c.email];
}
function marcarMensagemEnviada(email, etapa, valor){
  getOverlay(email).notificado[etapa] = !!valor;
  return Promise.resolve({ok:true});
}

// Configuração das mensagens do processo seletivo (nome de quem assina, coordenador de cada
// núcleo, diretor(a) responsável) — preenchida por ela na própria tela de Seleção. Fica só em
// memória por enquanto (mesma limitação do CURADORIA_OVERLAY: reseta ao recarregar a página),
// já que ainda não há backend para persistir de verdade.
let MSG_CONFIG = {
  // Usado só no fluxo de Diretores (msgAgendamentoDiretoria) — o de núcleo agora é fixo por
  // núcleo (Revisão 15), ver LAPSIA_DB.nucleos[].linkAgendamento.
  linkAgendamento: "",
  remetente: "Andressa",
  coordenadores: { "logoterapia":"", "morte-e-luto":"", "psicologia-escolar":"" },
  // Diretor(a) responsável por cada diretoria (nome + telefone) — usado na mensagem de
  // aprovação de Seleção de Diretores, igual ao coordenador de núcleo faz para Ligantes.
  diretores: {
    "academica-cientifica":{nome:"", telefone:""},
    "marketing-eventos":{nome:"", telefone:""},
    "financeira":{nome:"", telefone:""},
    "administrativa-pessoas":{nome:"", telefone:""}
  },
  // Quem a mensagem de "certificado disponível" (aba Certificados, Revisão 14) indica como
  // responsável por dúvidas — ela já passou esse valor ("Andressa e Gabriela"), diferente dos
  // outros campos desta configuração, que ainda ficam vazios até ela preencher.
  responsaveisCertificado: "Andressa e Gabriela"
};
const OPCAO_TO_NUCLEO_ID = { "Logoterapia":"logoterapia", "Morte e Luto":"morte-e-luto", "Psicologia Escolar":"psicologia-escolar" };

// Modelo oficial do certificado (PDF enviado por ela em 24/08/2026, feito no Canva) — usado por
// construirCertificadoPptx() para gerar o .pptx de verdade (Revisão 15). Presidente/coordenadora
// e o período do semestre são fixos por semestre (ela avisa quando precisar trocar); a carga
// horária de cada trilha já vem de LAPSIA_DB.nucleos[].cargaHoraria / ligaAmpliada.cargaHoraria
// (ver cargaHorariaPorOpcao) — ainda valores de exemplo, ela vai confirmar os números reais.
// O modelo enviado não tem campo de CPF — por isso o certificado gerado também não tem; se ela
// quiser um espaço para preencher o CPF à mão depois, é só avisar.
const CERTIFICADO_TEMPLATE = {
  semestre: "2026.2",
  periodoInicio: "Agosto/2026",
  periodoFim: "Dezembro/2026",
  presidente: { nome: "Ludmila Sulzbeck Guimarães Santos Rodrigues", cargo: "Presidente LAPSIA - UNITRI" },
  coordenadora: { nome: "Marilane Santos", cargo: "Coordenadora do curso de Psicologia - UNITRI" },
  corNavy: "0B1F3A",
  corNavyClara: "44546A",
  corTextoCorpo: "222222",
  corDourado: "B8996B",
  // Logo da Unitri extraído do PDF que ela enviou (recortado e com fundo transparente).
  logoBase64: "data:image/png;base64,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"
};
function espacado(s){ return String(s).split("").join(" "); }
function formatarDataExtensoPtBr(d){
  return new Intl.DateTimeFormat("pt-BR", { day:"numeric", month:"long", year:"numeric" }).format(d);
}
function escapeHtml(s){
  return String(s==null?"":s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
// Aviso temporário no canto da tela — usado hoje pelos botões de Certificados que ainda dependem
// do modelo de certificado que ela vai enviar (Revisão 14). Não trava a tela como um alert().
function showToast(mensagem){
  const host = document.getElementById('toast-host');
  if(!host) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = mensagem;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  }, 5200);
}
function setMsgConfig(campo, valor){
  if(campo === 'linkAgendamento') MSG_CONFIG.linkAgendamento = valor;
  else if(campo === 'remetente') MSG_CONFIG.remetente = valor;
  else if(campo.startsWith('coordenador:')) MSG_CONFIG.coordenadores[campo.split(':')[1]] = valor;
  else if(campo.startsWith('diretorNome:')) MSG_CONFIG.diretores[campo.split(':')[1]].nome = valor;
  else if(campo.startsWith('diretorTelefone:')) MSG_CONFIG.diretores[campo.split(':')[1]].telefone = valor;
  else if(campo === 'responsaveisCertificado') MSG_CONFIG.responsaveisCertificado = valor;
  // Re-renderiza o modal aberto (se houver) para as mensagens já saírem com o valor novo
  if(EVAL_STATE) openEvalModal(EVAL_STATE);
  if(EVAL_STATE_DIRETOR) openEvalModalDiretor(EVAL_STATE_DIRETOR.diretoriaId, EVAL_STATE_DIRETOR.email);
  if(EVAL_STATE_CERT) openCertificadoMsgModal(EVAL_STATE_CERT);
}

/* ============================== FUNÇÕES DE ACESSO A DADOS ==============================
   Tudo em LAPSIA_DB (dado de exemplo) por ora — a pedido dela (23/08/2026), a integração com
   as planilhas reais de Inscrições foi retirada desta versão para simplificar o dashboard;
   o mecanismo (fetch direto do CSV público do Google Sheets, sem Apps Script) está documentado
   no histórico do projeto e pode ser trazido de volta quando ela quiser reconectar. */

