/* ==================================================================================
   LAPSIA · SISTEMA DE GESTÃO — protótipo de front-end
   ----------------------------------------------------------------------------------
   Este arquivo é 100% autocontido (HTML+CSS+JS num só arquivo) e reproduz as telas
   já validadas com a IA anterior. A ideia é que TODO o conteúdo visível (indicadores,
   diretorias, núcleos, candidatos, certificados, rubrica de curadoria) venha de UM
   ÚNICO objeto de dados (LAPSIA_DB) e de um pequeno conjunto de funções fetchXxx().

   PARA CONECTAR À FONTE REAL (Google Sheets/Apps Script, Supabase, etc.):
   1. Não precisa tocar no HTML, no CSS nem nas funções render*() — elas já leem
      os dados através das funções fetchXxx() abaixo.
   2. Troque o CORPO de cada função fetchXxx()/salvarXxx() por uma chamada real
      (fetch('https://script.google.com/.../exec?api=1&fn=...') por exemplo),
      mantendo o mesmo formato de retorno (mesmo "shape" de objeto/array).
   3. Os pontos marcados com "// TODO(integração):" são exatamente onde a troca
      deve acontecer.
   ================================================================================== */

/* ------------------------- CREDENCIAL DE ACESSO (mock) -------------------------
   Autenticação real via Supabase Auth. */
const { createClient } = supabase;
const sb = createClient(
  "https://ahhyswegvwnfhnssnhbr.supabase.co",
  "sb_publishable_KrZefpWQw4FuSdg5qoKocg_LY6-TCOI"
);

/* ================================== ÍCONES ================================== */
const ICON = {
  users:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendarCheck:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>`,
  award:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>`,
  ribbon:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>`,
  clipboard:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="M9 12h6M9 16h6"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  fileText:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>`,
  shieldUser:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><circle cx="12" cy="9" r="2.3"/><path d="M8.5 15.2a3.7 3.7 0 0 1 7 0"/></svg>`,
  layers:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>`,
  settings:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`,
  chevronRight:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  thumbsUp:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  calendarPlus:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v6M9 17h6"/></svg>`,
  building:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M9 6h1M9 10h1M9 14h1M14 6h1M14 10h1M14 14h1"/></svg>`,
  inbox:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>`,
  cal:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  arrowLeft:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  brain:`<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2a5.5 5.5 0 0 0-4.9 8.02A4.5 4.5 0 0 0 6 18.5V20a2 2 0 0 0 2 2h1v-3M14.5 2a5.5 5.5 0 0 1 4.9 8.02A4.5 4.5 0 0 1 18 18.5V20a2 2 0 0 1-2 2h-1v-3M9.5 2c1.4 0 2.5 1.6 2.5 3.5S10.9 9 9.5 9M14.5 2c-1.4 0-2.5 1.6-2.5 3.5"/></svg>`,
  upload:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 0 4 4m-4-4L8 7"/><path d="M20 21H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1M20 13h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  person:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  save:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>`,
  sitemap:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="6" rx="1.5"/><rect x="2" y="16" width="7" height="6" rx="1.5"/><rect x="15" y="16" width="7" height="6" rx="1.5"/><path d="M12 8v4M5.5 16v-2a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>`
};

/* ================================== CAMADA DE DADOS ==================================
   Tudo abaixo é dado de exemplo, mas com a estrutura e o conteúdo real levantados no
   Plano Estratégico de Reestruturação 2026 e nos processos já implementados no
   dashboard atual (Google Sheets/Apps Script). Ajuste os valores conforme a fonte
   real for conectada. */

// Critérios alinhados ao Plano Estratégico seção 8.3 e às colunas da tabela `rubricas` no Supabase:
// nota_motivacao_alinhamento | nota_comprometimento | nota_postura_etica | nota_comunicacao_escuta
const RUBRICA_CRITERIOS = ["motivacao","comprometimento","postura_etica","comunicacao_escuta"];

const RUBRICA_LABELS = {
  motivacao:          "Motivação e alinhamento",
  comprometimento:    "Comprometimento",
  postura_etica:      "Postura ética",
  comunicacao_escuta: "Comunicação e escuta"
};

// Textos de faixa da rubrica — diferentes para Liga Ampliada x Núcleos, conforme
// já implementado no dashboard (o tooltip muda de acordo com a opção do candidato).
const RUBRICA_TEXTOS = {
  motivacao: {
    nucleo:{insuf:"Motivação genérica, sem conexão com o tema específico do núcleo.", parcial:"Motivação com o núcleo mencionada mas pouco articulada.", consist:"Motivação claramente conectada ao tema e aos objetivos do núcleo."},
    liga:{insuf:"Motivação genérica, sem conexão com o propósito da Liga Ampliada.", parcial:"Motivação com a Liga mencionada, mas pouco articulada.", consist:"Motivação claramente conectada ao propósito e à identidade da Liga."}
  },
  comprometimento: {
    nucleo:{insuf:"Incerteza sobre disponibilidade de horário ou resistência a cumprir entregas.", parcial:"Disponibilidade mencionada, mas sem clareza sobre entregas e frequência.", consist:"Disponibilidade confirmada, aceita as regras de frequência e entregas do núcleo."},
    liga:{insuf:"Incerteza sobre disponibilidade ou resistência ao compromisso com a Liga.", parcial:"Disponibilidade mencionada, mas sem clareza sobre entregas.", consist:"Disponibilidade confirmada, aceita as regras e o compromisso com a Liga."}
  },
  postura_etica: {
    nucleo:{insuf:"Postura pouco reflexiva ou falas que denotam preconceito e pouca escuta.", parcial:"Postura adequada, mas pouco articulada sobre ética e diversidade.", consist:"Postura ética e reflexiva, reconhece limites e valoriza a escuta e a diversidade."},
    liga:{insuf:"Postura pouco reflexiva ou falas que denotam preconceito e pouca escuta.", parcial:"Postura adequada, mas pouco articulada sobre ética e diversidade.", consist:"Postura ética e reflexiva, reconhece limites e valoriza a escuta e a diversidade."}
  },
  comunicacao_escuta: {
    nucleo:{insuf:"Dificuldade em comunicar ideias com clareza; pouca escuta ou interrupções frequentes.", parcial:"Comunicação adequada, mas escuta pouco desenvolvida ou respostas pouco articuladas.", consist:"Comunica-se com clareza, demonstra escuta ativa e sabe formular perguntas pertinentes."},
    liga:{insuf:"Dificuldade em comunicar ideias com clareza; pouca escuta ou interrupções frequentes.", parcial:"Comunicação adequada, mas escuta pouco desenvolvida ou respostas pouco articuladas.", consist:"Comunica-se com clareza, demonstra escuta ativa e sabe formular perguntas pertinentes."}
  }
};

// Vagas e nota mínima por opção (equivalente à aba Config_Curadoria do Sheets)
const OPCOES_CONFIG = {
  "Liga Ampliada": {vagas:50, corte:8},
  "Logoterapia": {vagas:8, corte:12},
  "Morte e Luto": {vagas:8, corte:12},
  "Psicologia Escolar": {vagas:8, corte:12}
};

// Sinalização automática por palavra-chave na Seleção de Diretores (avaliarCandidatoDiretoria_
// + DIRETORIA_TEMA_MAP + THEME_DICTIONARY, conforme já implementado no dashboard real). É só
// apoio à decisão humana, nunca um corte automático. Só existe para estas 3 diretorias — a
// Administrativa e de Pessoas nunca teve esse sinal automático no sistema real, então o selo
// dela é sempre marcado manualmente (ver campo seloManual mais abaixo).
const DIRETORIA_TEMA_MAP = {
  "academica-cientifica": {
    tema:"Produção científica, pesquisa e calendário pedagógico",
    keywords:["científic","pesquisa","artigo","metodologia","ementa","leitura","produção","acadêmic","orientação","congresso"]
  },
  "marketing-eventos": {
    tema:"Comunicação, identidade visual e eventos",
    keywords:["instagram","comunicaç","evento","palestra","divulgaç","rede social","conteúdo","design","arte","whatsapp"]
  },
  "financeira": {
    tema:"Finanças, prestação de contas e patrocínio",
    keywords:["financ","planilha","caixa","patroc","orçamento","prestação de contas","despesa","receita"]
  }
};
function computeSelo(diretoriaId, texto){
  const cfg = DIRETORIA_TEMA_MAP[diretoriaId];
  if(!cfg) return null; // diretoria sem sinalização automática (ex.: Administrativa e de Pessoas)
  const t = (texto || "").toLowerCase();
  const hits = cfg.keywords.filter(k => t.includes(k)).length;
  if(hits >= 2) return {label:"recomendado", cls:"badge-green", icon:ICON.thumbsUp};
  if(hits === 1) return {label:"atenção", cls:"badge-yellow", icon:""};
  return {label:"não recomendado", cls:"badge-gray", icon:""};
}

