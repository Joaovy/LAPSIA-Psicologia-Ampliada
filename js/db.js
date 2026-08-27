const LAPSIA_DB = {
  liga: {
    nome:"LAPSIA",
    subtitulo:"Psicologia Ampliada · UNITRI",
    candidatosEmSelecaoTotal: 15 // TODO(integração): contagem real de candidatos (diretores+ligantes) ainda em processo, em todas as diretorias/núcleos
  },

  proximosEncontros: [
    // Ex.: {data:"2026-08-25", titulo:"Base Coletiva: ética e construção científica", local:"Sala 12"}
    // Vazio de propósito — reproduz o estado atual ("Nenhum encontro programado")
  ],

  diretorias: [
    {
      id:"academica-cientifica",
      nome:"Acadêmica e Científica",
      objetivo:"Planejar a qualidade pedagógica dos encontros e garantir o rigor científico da produção acadêmica da liga.",
      responsabilidades:[
        "Elaborar e atualizar o calendário pedagógico do semestre",
        "Aprovar as ementas semestrais dos núcleos temáticos",
        "Definir e orientar o modelo de produção científica de cada núcleo",
        "Acompanhar os relatórios mensais dos coordenadores de núcleo",
        "Organizar o grupo de leitura base e validar referências bibliográficas"
      ],
      entregas:[
        "Calendário pedagógico aprovado até a 2ª semana do semestre",
        "Plano de produção científica semestral (entregue na 3ª semana)",
        "Relatório mensal consolidado dos núcleos"
      ],
      criterios:[
        "Calendário atualizado e pautas entregues no prazo",
        "Ao menos 2 orientações coletivas de produção científica por mês",
        "Reunião mensal com coordenadores de núcleo realizada"
      ],
      submodulos:[
        {id:"cronograma", nome:"Cronograma", implementado:true}
      ],
      candidatosInscritos:[
        {nome:"Gabriel Henrique Martins", periodo:"5º", turno:"Noturno", email:"gabriel.martins@unitri.edu.br", telefone:"(34) 9 9812-3456", dataInscricao:"19/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Quero contribuir com a produção científica da liga, organizando palestras e grupos de leitura para os núcleos."},
        {nome:"Isadora Ferreira Lima", periodo:"2º", turno:"Matutino", email:"isadora.lima@unitri.edu.br", telefone:"(34) 9 9723-1198", dataInscricao:"20/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Gosto de estudar e quero ajudar a organizar o calendário pedagógico e os grupos de leitura da diretoria."}
      ]
    },
    {
      id:"marketing-eventos",
      nome:"Marketing e Eventos",
      objetivo:"Planejar eventos e manter a comunicação e a identidade visual da LAPSIA com consistência e alinhamento institucional.",
      responsabilidades:[
        "Gerir o Instagram e o WhatsApp oficial da liga",
        "Criar e publicar conteúdo alinhado à identidade visual",
        "Prospectar, contactar e confirmar palestrantes e convidados",
        "Coordenar a logística de palestras, aulas inaugurais e eventos externos",
        "Produzir artes de eventos e encontros e comunicar o calendário"
      ],
      entregas:[
        "Mínimo de 3 publicações semanais no Instagram",
        "Ao menos 2 eventos externos por semestre, com checklist preenchido",
        "Arte de cada evento publicada com 5 dias de antecedência"
      ],
      criterios:[
        "Publicações semanais e lembretes de encontro cumpridos",
        "Mínimo de 2 eventos realizados por semestre",
        "Avaliações pós-evento registradas"
      ],
      submodulos:[],
      candidatosInscritos:[
        {nome:"Rafaela Nunes Costa", periodo:"3º", turno:"Noturno", email:"rafaela.costa@unitri.edu.br", telefone:"(34) 9 9654-7712", dataInscricao:"18/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Tenho experiência com Instagram e adoraria cuidar da comunicação e das artes de divulgação da liga."},
        {nome:"Thiago Barros Almeida", periodo:"1º", turno:"Matutino", email:"thiago.almeida@unitri.edu.br", telefone:"(34) 9 9345-8890", dataInscricao:"21/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Gostaria de ajudar a organizar palestras e eventos externos da liga."}
      ]
    },
    {
      id:"financeira",
      nome:"Financeira",
      objetivo:"Garantir a saúde financeira da liga com transparência e responsabilidade.",
      responsabilidades:[
        "Manter a planilha de entradas e saídas atualizada",
        "Aprovar despesas em conjunto com a presidência",
        "Prospectar patrocinadores e parcerias",
        "Apresentar a prestação de contas mensal à diretoria",
        "Gerir o caixa de eventos"
      ],
      entregas:[
        "Planilha financeira atualizada semanalmente",
        "Relatório financeiro mensal enviado à diretoria",
        "Prestação de contas semestral pública"
      ],
      criterios:[
        "Planilha sempre atualizada",
        "Relatório mensal entregue em dia",
        "Nenhuma despesa sem aprovação prévia"
      ],
      submodulos:[],
      candidatosInscritos:[
        {nome:"Larissa Cardoso Ribeiro", periodo:"4º", turno:"Matutino", email:"larissa.ribeiro@unitri.edu.br", telefone:"(34) 9 9987-2231", dataInscricao:"19/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Curso Ciências Contábeis também e quero ajudar a organizar a planilha financeira e a prestação de contas da liga."},
        {nome:"Eduardo Vasconcelos Pinto", periodo:"6º", turno:"Noturno", email:"eduardo.pinto@unitri.edu.br", telefone:"(34) 9 9456-6674", dataInscricao:"20/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Quero fazer parte da diretoria e aprender mais sobre gestão financeira na prática."}
      ]
    },
    {
      id:"administrativa-pessoas",
      nome:"Administrativa e de Pessoas",
      objetivo:"Garantir o funcionamento logístico, documental e humano da liga, com organização, precisão e cuidado com as pessoas.",
      responsabilidades:[
        "Gerenciar inscrições de diretores e ligantes",
        "Coordenar o processo de aprovação (curadoria)",
        "Controlar presença e emitir certificados",
        "Organizar o feedback semestral"
      ],
      entregas:[
        "Relatório de seleção e curadoria do semestre",
        "Controle de presença atualizado",
        "Emissão de certificados no prazo"
      ],
      criterios:[
        "Participar de pelo menos 80% das reuniões da diretoria",
        "Manter os registros de presença em dia",
        "Sigilo total sobre dados de candidatos (CPF, telefone)"
      ],
      submodulos:[
        {id:"selecao-diretores", nome:"Seleção de Diretores", implementado:true},
        {id:"selecao-ligantes", nome:"Seleção de Ligantes", implementado:true},
        {id:"presenca", nome:"Frequência", implementado:true},
        {id:"certificados", nome:"Certificados", implementado:true},
        {id:"feedback", nome:"Feedback", implementado:true},
        {id:"agendamento-sala", nome:"Agendamento de Sala", implementado:true}
      ],
      candidatosInscritos:[
        {nome:"Camila Rezende Duarte", periodo:"2º", turno:"Noturno", email:"camila.duarte@unitri.edu.br", telefone:"(34) 9 9223-4487", dataInscricao:"21/08/2026", seloManual:"recomendado", entrevista:null, resultadoEntrevista:null,
         motivacao:"Quero organizar a gestão de pessoas da liga, cuidando de inscrições, presença e certificados com organização e atenção aos detalhes."},
        {nome:"Vinícius Andrade Sales", periodo:"5º", turno:"Matutino", email:"vinicius.sales@unitri.edu.br", telefone:"(34) 9 9778-3321", dataInscricao:"22/08/2026", entrevista:null, resultadoEntrevista:null,
         motivacao:"Tenho perfil organizado e quero ajudar no controle de presença e na emissão de certificados da liga."}
      ]
    }
  ],

  nucleos: [
    {
      id:"logoterapia",
      nome:"Logoterapia",
      descricao:"Núcleo dedicado ao estudo da logoterapia e análise existencial, com foco na obra de Viktor Frankl e a busca de sentido na vida.",
      responsabilidades:[
        "Estudar os fundamentos teóricos da logoterapia",
        "Discutir aplicações práticas da análise existencial",
        "Promover reflexões sobre sentido da vida e sofrimento"
      ],
      criterios:[
        "Frequência mínima de 75% nos encontros do núcleo",
        "Participação ativa nas discussões",
        "Postura ética e respeitosa"
      ],
      // Carga horária certificada ao concluir o núcleo — valor de exemplo (23/08/2026, Revisão 14):
      // ela ainda vai confirmar o número real; troque aqui quando ela passar o valor definitivo.
      cargaHoraria: 40,
      // Link fixo de agendamento (Google Calendar) deste núcleo — ela passou esse valor em
      // 24/08/2026 (Revisão 15) e pediu que fosse fixo, então fica aqui no cadastro do núcleo
      // em vez de um campo editável em MSG_CONFIG (que reseta a cada sessão).
      linkAgendamento: "https://calendar.app.google/y5dnSyC7v4V7rL466",
      encontros:[
        {numero:"01", titulo:"Logoterapia: fundamentos de Viktor Frankl"}
      ]
    },
    {
      id:"morte-e-luto",
      nome:"Morte e Luto",
      descricao:"Núcleo dedicado ao estudo dos processos de luto, terminalidade e cuidado psicológico diante da perda, com ênfase na prática ética do psicólogo em contextos de finitude.",
      responsabilidades:[
        "Estudar os processos de luto, terminalidade e cuidado psicológico diante da perda",
        "Discutir perspectivas clínicas, existenciais, culturais e sociais sobre a finitude",
        "Promover reflexões sobre a prática ética do psicólogo em contextos de perda"
      ],
      criterios:[
        "Frequência mínima de 75% nos encontros do núcleo",
        "Participação ativa nas discussões",
        "Postura ética e respeitosa"
      ],
      cargaHoraria: 40,
      linkAgendamento: "https://calendar.app.google/TrD1JrEtCaz6tL1QA",
      encontros:[
        {numero:"01", titulo:"Morte e Luto: processos de luto e terminalidade (Worden, Kübler-Ross)"}
      ]
    },
    {
      id:"psicologia-escolar",
      nome:"Psicologia Escolar",
      descricao:"Núcleo dedicado à atuação do psicólogo no ambiente escolar, com foco em desenvolvimento, aprendizagem, subjetividade e relações institucionais, sob perspectiva crítica e inclusiva.",
      responsabilidades:[
        "Estudar a atuação do psicólogo no ambiente escolar",
        "Discutir desenvolvimento, aprendizagem, subjetividade e relações institucionais",
        "Promover reflexões críticas e inclusivas sobre políticas educacionais"
      ],
      criterios:[
        "Frequência mínima de 75% nos encontros do núcleo",
        "Participação ativa nas discussões",
        "Postura ética e respeitosa"
      ],
      cargaHoraria: 40,
      linkAgendamento: "https://calendar.app.google/fbsjtCXYoof4xcZk6",
      encontros:[
        {numero:"01", titulo:"Psicologia Escolar: atuação do psicólogo na educação"}
      ]
    }
  ],

  // Liga Ampliada não é um núcleo temático (não tem coordenador de núcleo nem entrevista no
  // processo seletivo — ver etapaProcessoLigante), mas ganhou um módulo próprio na barra
  // lateral, abaixo dos núcleos, com a mesma estrutura de página (responsabilidades, critérios
  // de permanência, encontros e a lista de ligantes já aprovados nela).
  ligaAmpliada: {
    id:"liga-ampliada",
    nome:"Liga Ampliada",
    descricao:"Formação inicial e mais abrangente da LAPSIA, aberta a todos os períodos, com uma introdução ampla à psicologia ampliada antes de uma eventual escolha por um núcleo temático.",
    responsabilidades:[
      "Participar dos encontros gerais da Liga Ampliada",
      "Acompanhar os temas e discussões propostas em cada encontro",
      "Ler o material de compromissos do(a) ligante encaminhado na entrada",
      "Manter a frequência mínima exigida para continuar na Liga"
    ],
    criterios:[
      "Frequência mínima de 75% nos encontros",
      "Participação ativa nas discussões",
      "Postura ética e respeitosa"
    ],
    // Carga horária certificada — valor de exemplo (23/08/2026, Revisão 14), menor que a dos
    // núcleos porque a Liga Ampliada não passa por entrevista/produção científica; ela ainda
    // vai confirmar o número real.
    cargaHoraria: 30,
    encontros:[
      {numero:"01", titulo:"Abertura do semestre e apresentação da LAPSIA"}
    ]
  },

  // Curadoria de ligantes (2026.2) — nome+opção chaveiam a nota, igual ao Sheets real.
  // Lote "recém-puxado do Forms" (23/08/2026, a pedido dela): todo mundo pristino — sem
  // notas, sem ética marcada, sem entrevista, sem resultado — pra ela testar o fluxo
  // completo do zero (rubrica → agendamento → entrevista → devolutiva → Organograma →
  // Frequência) com cada um. Dois candidatos por opção; "Alex Souza Martins" é de propósito
  // um nome ambíguo, pra ela ver o fallback neutro "aprovado(a)" da flexão de gênero em ação.
  candidatosCuradoria: [
    {nome:"Sofia Almeida Rocha", email:"sofia.rocha@unitri.edu.br", telefone:"(34) 9 9112-5563", turno:"Matutino", periodo:"1º", opcao:"Liga Ampliada", dataInscricao:"20/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Quero participar da liga para ter uma formação mais ampla desde o início da graduação.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Alex Souza Martins", email:"alex.martins@unitri.edu.br", telefone:"(34) 9 9223-6674", turno:"Noturno", periodo:"2º", opcao:"Liga Ampliada", dataInscricao:"21/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Busco vivências de ciência, ética e escuta que complementem minha formação em Psicologia.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Rodrigo Teixeira Nunes", email:"rodrigo.nunes@unitri.edu.br", telefone:"(34) 9 9334-7785", turno:"Noturno", periodo:"4º", opcao:"Logoterapia", dataInscricao:"19/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Me interesso por Viktor Frankl e pela busca de sentido, quero estudar isso com mais profundidade.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Manuela Prado Siqueira", email:"manuela.siqueira@unitri.edu.br", telefone:"(34) 9 9445-8896", turno:"Matutino", periodo:"3º", opcao:"Logoterapia", dataInscricao:"22/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Quero aprofundar meus estudos em logoterapia e análise existencial, área que pretendo seguir na pós-graduação.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Bruno Cavalcanti Reis", email:"bruno.reis@unitri.edu.br", telefone:"(34) 9 9556-9907", turno:"Noturno", periodo:"5º", opcao:"Morte e Luto", dataInscricao:"18/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Tenho interesse em cuidados paliativos e quero entender melhor o papel do psicólogo diante da finitude.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Valentina Moraes Freitas", email:"valentina.freitas@unitri.edu.br", telefone:"(34) 9 9667-1018", turno:"Matutino", periodo:"2º", opcao:"Morte e Luto", dataInscricao:"21/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Quero estudar os processos de luto e terminalidade com mais profundidade, é um tema que me toca bastante.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Felipe Andrade Barros", email:"felipe.barros@unitri.edu.br", telefone:"(34) 9 9778-2129", turno:"Matutino", periodo:"6º", opcao:"Psicologia Escolar", dataInscricao:"20/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Tenho interesse em psicologia escolar e quero levar projetos práticos pras escolas da região.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    {nome:"Letícia Nogueira Campos", email:"leticia.campos@unitri.edu.br", telefone:"(34) 9 9889-3230", turno:"Noturno", periodo:"1º", opcao:"Psicologia Escolar", dataInscricao:"22/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Quero entender melhor o desenvolvimento e a aprendizagem das crianças no ambiente escolar.",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}},
    // Dado de teste REAL (não fictício) — ela pediu explicitamente (24/08/2026) pra subir com
    // esses dados pra validar a experiência do Ligante ponta a ponta com nome/telefone reais.
    // Pristino de propósito, igual ao lote da Revisão 12, pra ela poder rodar o fluxo inteiro
    // (rubrica → agendamento → entrevista → devolutiva → frequência) a partir do zero.
    {nome:"Andressa dos Santos Machado", email:"andressa.machado@sankhya.com", telefone:"(34) 9 9276-2325", turno:"Noturno", periodo:"1º", opcao:"Morte e Luto", dataInscricao:"24/08/2026", entrevista:null, resultadoEntrevista:null, observacoes:"",
     motivacaoTexto:"Dado de teste real (adicionado a pedido dela em 24/08/2026, para validar a experiência do Ligante).",
     etica:"", notas:{motivacao:null, interesse:null, comprometimento:null, contribuicao:null}}
  ],

  // Zerado de propósito nesta rodada (23/08/2026): como o gatilho automático da Revisão 9
  // (garantirAcompanhamentoFrequencia) preenche esta lista sozinho conforme ela vai aprovando
  // gente em Seleção de Ligantes, começar vazio deixa claro, no teste, que cada linha que
  // aparecer aqui veio do fluxo — e não de um dado de exemplo que já estava pronto antes.
  certificados: [],

  // Modelo de referência do Plano Estratégico 2026 (15 semanas) — usado na página de Cronograma
  cronograma: [
    {semana:"Pré-semestre", base:"—", nucleos:"—", diretoria:"Plano semestral, calendário e seleção de ligantes"},
    {semana:"Semana 1", base:"Encontro de Integração (obrigatório)", nucleos:"—", diretoria:"Onboarding; formação dos grupos dos núcleos"},
    {semana:"Semana 2", base:"Aula inaugural (convidado)", nucleos:"—", diretoria:"Publicação do calendário; planos dos núcleos aprovados"},
    {semana:"Semana 3", base:"O que é a LAPSIA; ética; CFP", nucleos:"1º encontro de cada núcleo", diretoria:"Plano científico aprovado"},
    {semana:"Semana 4", base:"Construção científica; como ler um artigo", nucleos:"2º encontro de cada núcleo", diretoria:"Reunião deliberativa quinzenal"},
    {semana:"Semana 5", base:"—", nucleos:"3º encontro de cada núcleo", diretoria:"Relatório mensal; checkpoint de presença"},
    {semana:"Semana 6", base:"—", nucleos:"4º encontro + início da produção coletiva", diretoria:"Reunião deliberativa; orientação coletiva"},
    {semana:"Semana 7", base:"—", nucleos:"5º encontro (produção coletiva)", diretoria:"Checkpoint de engajamento; alertas emitidos"},
    {semana:"Semana 8", base:"Encontro com convidado (toda a liga)", nucleos:"6º encontro", diretoria:"Relatório mensal; reunião deliberativa"},
    {semana:"Semana 9", base:"—", nucleos:"7º encontro (produção avançando)", diretoria:"Avaliação de meio de semestre"},
    {semana:"Semana 10", base:"—", nucleos:"8º encontro + versão preliminar", diretoria:"Dir. Científica: feedback às produções"},
    {semana:"Semana 11", base:"—", nucleos:"9º encontro (revisão da produção)", diretoria:"Reunião deliberativa; alertas de infrequência"},
    {semana:"Semana 12", base:"—", nucleos:"10º encontro + entrega versão final", diretoria:"Relatório mensal; preparação do encerramento"},
    {semana:"Semana 13", base:"Apresentação das produções dos núcleos", nucleos:"11º encontro (apresentação)", diretoria:"Preparação de certificados; formulário de avaliação"},
    {semana:"Semana 14", base:"—", nucleos:"12º encontro (avaliação do núcleo)", diretoria:"Avaliação semestral individual; feedbacks"},
    {semana:"Semana 15", base:"Encontro de Finalização (obrigatório)", nucleos:"—", diretoria:"Certificados; relatório semestral; passagem de cargo"}
  ],

  // Encontros já datados (visão "Linha do tempo" do Cronograma) — poucas datas de exemplo,
  // o suficiente para mostrar o formato; o resto do semestre segue o modelo de 15 semanas acima.
  cronogramaEncontros: [
    {data:"2026-08-30", inicio:"19:00", fim:"21:00", opcao:"Liga Ampliada", turno:"Noturno", titulo:"Abertura do semestre e apresentação", sala:"Sala 12", responsavel:"Coordenação"},
    {data:"2026-08-31", inicio:"08:00", fim:"10:00", opcao:"Logoterapia", turno:"Matutino", titulo:"Logoterapia: fundamentos de Viktor Frankl", sala:"Sala 8", responsavel:"Diretoria Acadêmica"},
    {data:"2026-09-01", inicio:"19:00", fim:"21:00", opcao:"Morte e Luto", turno:"Noturno", titulo:"Teorias do luto: Parkes e Kübler-Ross", sala:"Sala 6", responsavel:"Coordenação do Núcleo"},
    {data:"2026-09-02", inicio:"08:00", fim:"10:00", opcao:"Psicologia Escolar", turno:"Matutino", titulo:"Psicologia Escolar: atuação na educação básica", sala:"Sala 9", responsavel:"Diretoria Acadêmica"},
    {data:"2026-09-07", inicio:"19:00", fim:"20:30", opcao:"Logoterapia", turno:"Noturno", titulo:"Logoterapia: sentido e liberdade em Frankl", sala:"Sala 8", responsavel:"Coordenação do Núcleo"},
    {data:"2026-09-08", inicio:"08:00", fim:"09:30", opcao:"Morte e Luto", turno:"Matutino", titulo:"Cuidados paliativos e finitude", sala:"Sala 6", responsavel:"Coordenação do Núcleo"}
  ],

  // Uploads de calendário de referência (em memória — sem backend ainda, ver handleCalendarUpload)
  calendariosReferencia: {faculdade:null, nucleos:null, geral:null},

  // Feedback semestral — anônimo por desenho (RAW_Form_Feedback_AAAA_S no Sheets real).
  // Nunca tem nome/e-mail do respondente, só opção/turno (pra permitir o filtro) + as notas.
  feedbackRespostas: [
    {opcao:"Logoterapia", turno:"Matutino", notaEncontros:4, concOrganizados:4, concConteudo:4, concRitmo:3,
     palavraChave:"Acolhedor", oQueMudar:"Poderia ter mais tempo de discussão em grupo.", comentario:"Gostei muito da condução dos encontros e da leitura de base."},
    {opcao:"Liga Ampliada", turno:"Noturno", notaEncontros:4, concOrganizados:4, concConteudo:4, concRitmo:3,
     palavraChave:"Formativo", oQueMudar:"Avisar a pauta do encontro com mais antecedência.", comentario:"Senti que aprendi bastante sobre ética e escuta."},
    {opcao:"Morte e Luto", turno:"Noturno", notaEncontros:4, concOrganizados:4, concConteudo:5, comentario:"Encontros muito bem preparados, dava pra perceber o cuidado da coordenação.",
     concRitmo:4, palavraChave:"Intenso", oQueMudar:"Nada a mudar por enquanto."}
  ],

  // Chamada de presença (tabela detalhada, "submodelo" de Frequência) — cruza os ligantes ativos
  // (certificados) com os encontros já datados (cronogramaEncontros) da mesma opção. Dado de exemplo;
  // o real viria de uma lista de presença por encontro (formulário/QR code na entrada, etc.).
  chamada: [
    {ligante:"Beatriz Carvalho", turno:"Noturno", opcao:"Liga Ampliada", data:"2026-08-30", presente:true},
    {ligante:"Elaine Pereira", turno:"Matutino", opcao:"Liga Ampliada", data:"2026-08-30", presente:true},
    {ligante:"Helena Albuquerque", turno:"Matutino", opcao:"Liga Ampliada", data:"2026-08-30", presente:false},
    {ligante:"Juliana Mendes", turno:"Noturno", opcao:"Liga Ampliada", data:"2026-08-30", presente:true},
    {ligante:"Diego Fernandes", turno:"Matutino", opcao:"Logoterapia", data:"2026-08-31", presente:true},
    {ligante:"Lucas Oliveira", turno:"Matutino", opcao:"Logoterapia", data:"2026-08-31", presente:true},
    {ligante:"Diego Fernandes", turno:"Matutino", opcao:"Logoterapia", data:"2026-09-07", presente:false},
    {ligante:"Lucas Oliveira", turno:"Matutino", opcao:"Logoterapia", data:"2026-09-07", presente:true},
    {ligante:"Gustavo Henrique", turno:"Noturno", opcao:"Morte e Luto", data:"2026-09-01", presente:true},
    {ligante:"Gustavo Henrique", turno:"Noturno", opcao:"Morte e Luto", data:"2026-09-08", presente:true},
    {ligante:"Igor Batista", turno:"Noturno", opcao:"Psicologia Escolar", data:"2026-09-02", presente:true}
  ]
};
// Guarda uma cópia dos candidatos de exemplo de cada diretoria, já que fetchDiretorias()
// remonta d.candidatosInscritos (mesclando com o overlay de curadoria) a cada render.
LAPSIA_DB.diretorias.forEach(d => { d._candidatosInscritosExemplo = d.candidatosInscritos; });
