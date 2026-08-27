
/* ================================== RENDER: SIDEBAR ================================== */
function renderSidebar(){
  const el = document.getElementById("sidebar-scroll");
  let html = `<div class="nav-section-title">Visão Geral</div>`;
  html += navItem({icon:ICON.layers, label:"Dashboard", active: CURRENT_PAGE.type==="dashboard", onclick:`navigate({type:'dashboard'})`});
  html += navItem({icon:ICON.sitemap, label:"Organograma", active: CURRENT_PAGE.type==="organograma", onclick:`navigate({type:'organograma'})`});

  html += `<div class="nav-section-title">Diretorias</div>`;
  LAPSIA_DB.diretorias.forEach(d => {
    const isActiveParent = (CURRENT_PAGE.type==="diretoria" && CURRENT_PAGE.id===d.id) || (CURRENT_PAGE.type==="submodulo" && CURRENT_PAGE.diretoriaId===d.id);
    const open = OPEN_GROUPS.has(d.id);
    html += `<div class="nav-group ${open?'open':''}">
      <div class="nav-group-header ${isActiveParent?'parent-active':''}" onclick="navigate({type:'diretoria', id:'${d.id}'})">
        <span>${d.nome}</span>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onclick="toggleGroup('${d.id}', event)"><path d="m9 18 6-6-6-6"/></svg>
      </div>
      <div class="nav-subitems">`;
    if(d.submodulos.length === 0){
      html += `<div class="nav-subitem disabled">Módulos a definir</div>`;
    } else {
      d.submodulos.forEach(sm => {
        const activeSub = CURRENT_PAGE.type==="submodulo" && CURRENT_PAGE.diretoriaId===d.id && CURRENT_PAGE.submoduloId===sm.id;
        if(sm.implementado){
          html += `<div class="nav-subitem ${activeSub?'active':''}" onclick="navigate({type:'submodulo', diretoriaId:'${d.id}', submoduloId:'${sm.id}'})">${sm.nome}</div>`;
        } else {
          html += `<div class="nav-subitem disabled">${sm.nome} (em definição)</div>`;
        }
      });
    }
    html += `</div></div>`;
  });

  html += `<div class="nav-section-title">Núcleos</div>`;
  LAPSIA_DB.nucleos.forEach(n => {
    html += navItem({icon:ICON.book, label:n.nome, active: CURRENT_PAGE.type==="nucleo" && CURRENT_PAGE.id===n.id, onclick:`navigate({type:'nucleo', id:'${n.id}'})`});
  });
  html += navItem({icon:ICON.book, label:"Liga Ampliada", active: CURRENT_PAGE.type==="liga-ampliada", onclick:`navigate({type:'liga-ampliada'})`});

  html += `<div class="nav-section-title">Sistema</div>`;
  html += navItem({icon:ICON.settings, label:"Configurações", active: CURRENT_PAGE.type==="config", onclick:`navigate({type:'config'})`});

  el.innerHTML = html;
}
function navItem({icon,label,active,onclick}){
  return `<div class="nav-item ${active?'active':''}" onclick="${onclick}">${icon}<span>${label}</span></div>`;
}

/* ================================== RENDER: MAIN ================================== */
async function renderMain(){
  const main = document.getElementById("main");
  const crumb = document.getElementById("crumb-text");
  const p = CURRENT_PAGE;
  main.innerHTML = `<div class="empty-state" style="padding:80px 0;">Carregando…</div>`;

  if(p.type === "dashboard"){
    crumb.textContent = "Dashboard";
    main.innerHTML = await renderDashboardPage();
  } else if(p.type === "organograma"){
    crumb.textContent = "Organograma";
    main.innerHTML = await renderOrganogramaPage();
  } else if(p.type === "diretoria"){
    const d = await fetchDiretoria(p.id);
    if(!d){ main.innerHTML = `<div class="empty-state">Diretoria não encontrada.</div>`; return; }
    crumb.textContent = "Diretoria " + d.nome;
    main.innerHTML = renderDiretoriaPage(d);
  } else if(p.type === "submodulo"){
    const d = await fetchDiretoria(p.diretoriaId);
    if(!d){ main.innerHTML = `<div class="empty-state">Diretoria não encontrada.</div>`; return; }
    const sm = d.submodulos.find(s => s.id === p.submoduloId);
    if(!sm){ main.innerHTML = `<div class="empty-state">Módulo não encontrado.</div>`; return; }
    crumb.textContent = d.nome + " · " + sm.nome;
    main.innerHTML = await renderSubmodulePage(d, sm);
  } else if(p.type === "nucleo"){
    const n = await fetchNucleo(p.id);
    crumb.textContent = "Núcleo " + n.nome;
    main.innerHTML = await renderNucleoPage(n);
  } else if(p.type === "liga-ampliada"){
    const la = await fetchLigaAmpliada();
    crumb.textContent = la.nome;
    main.innerHTML = await renderLigaAmpliadaPage(la);
  } else if(p.type === "config"){
    crumb.textContent = "Configurações";
    main.innerHTML = renderConfigPage();
  }
}

function demoBadge(){
  return `<span class="badge badge-demo">Dados de exemplo</span>`;
}

/* ---------- DASHBOARD ---------- */
async function renderDashboardPage(){
  const ind = await fetchDashboardIndicadores();
  const encontros = await fetchProximosEncontros();

  const stats = [
    {icon:ICON.users, color:"#3b82f6", bg:"#eff6ff", value:ind.ligantesAtivos, label:"Ligantes Ativos"},
    {icon:ICON.calendarCheck, color:"#16a34a", bg:"#f0fdf4", value:ind.presencaMedia+"%", label:"Presença Média"},
    {icon:ICON.award, color:"#f59e0b", bg:"#fffbeb", value:ind.certificadosPendentes, label:"Certificados Pendentes"},
    {icon:ICON.ribbon, color:"#16a34a", bg:"#f0fdf4", value:ind.certificadosEmitidos, label:"Certificados Emitidos"},
    {icon:ICON.clipboard, color:"#8b5cf6", bg:"#f5f3ff", value:ind.candidatosEmSelecao, label:"Candidatos em Seleção"},
  ];

  let statsHtml = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.bg}">${s.icon.replace('stroke-width="2"', `stroke-width="2" stroke="${s.color}"`)}</div>
      <div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    </div>`).join("");

  let encontrosHtml = "";
  if(encontros.length === 0){
    encontrosHtml = `<div class="empty-state">Nenhum encontro programado</div>`;
  } else {
    encontrosHtml = encontros.map(e => `
      <div class="meeting-row">
        <div class="meeting-num">${ICON.cal}</div>
        <div><div class="meeting-title">${e.titulo}</div><div class="candidate-meta">${e.data}${e.local ? ' · '+e.local : ''}</div></div>
      </div>`).join("");
  }

  return `
    <div class="page-header">
      <div class="title-row"><h1>Visão Geral da Liga</h1>${demoBadge()}</div>
      <div class="subtitle">Indicadores consolidados da LAPSIA</div>
    </div>
    <div class="stat-grid">${statsHtml}</div>
    <div class="card">
      <div class="card-header-row">
        <h2>Próximos Encontros</h2>
        <span class="card-link" onclick="navigate({type:'submodulo', diretoriaId:'academica', submoduloId:'cronograma'})">Ver cronograma completo</span>
      </div>
      ${encontrosHtml}
    </div>
  `;
}

/* ---------- DIRETORIA ---------- */
function renderDiretoriaPage(d){
  let candidatosHtml = "";
  if(d.candidatosInscritos.length){
    candidatosHtml = `
      <div class="card">
        <div class="card-header-row"><h2>Candidatos Inscritos</h2></div>
        <div class="subtitle" style="margin:-8px 0 14px;">${d.candidatosInscritos.length} candidato${d.candidatosInscritos.length>1?'s':''} para esta diretoria</div>
        ${d.candidatosInscritos.map(c => candidateCardHtml(c, d.id)).join("")}
      </div>`;
  }

  return `
    <div class="page-header">
      <div class="title-row"><h1>${d.nome}</h1>${demoBadge()}</div>
      <div class="subtitle">Área específica da diretoria</div>
    </div>
    <div class="card-row card-row-3">
      <div class="card">
        <h3>${ICON.clipboard} Responsabilidades</h3>
        <ul class="check-list">${d.responsabilidades.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3>${ICON.fileText} Entregas</h3>
        <ul class="check-list">${d.entregas.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3>${ICON.shieldUser} Critérios de Permanência</h3>
        <ul class="check-list">${d.criterios.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
    </div>
    ${candidatosHtml}
    <div class="card">
      <div class="card-header-row"><h2>Submódulos</h2></div>
      <div class="subtitle" style="margin:-8px 0 0;">Acesse as ferramentas administradas por esta diretoria.</div>
      <div class="submodule-grid">
        ${d.submodulos.length ? d.submodulos.map(sm => `
          <div class="submodule-card ${sm.implementado?'':'disabled'}" onclick="${sm.implementado?`navigate({type:'submodulo', diretoriaId:'${d.id}', submoduloId:'${sm.id}'})`:''}">
            <div class="submodule-icon">${ICON.chevronRight}</div>
            <div>
              <div class="sm-title">${sm.nome}</div>
              <div class="sm-action ${sm.implementado?'':'muted'}">${sm.implementado?'Abrir submódulo':'Módulo em definição'}</div>
            </div>
          </div>`).join("") : `<div class="empty-state" style="grid-column:1/-1;">Módulos a definir para esta diretoria</div>`}
      </div>
    </div>
  `;
}

function candidateCardHtml(c, diretoriaId){
  const selo = computeSelo(diretoriaId, c.motivacao) || (c.seloManual ? {label:c.seloManual, cls:"badge-green", icon:ICON.thumbsUp} : null);
  return `
    <div class="candidate-card">
      <div class="candidate-top">
        <div>
          <div class="candidate-name">${c.nome}</div>
          <div class="candidate-meta">
            <span>Período: ${c.periodo}</span><span>Turno: ${c.turno}</span><span>${c.email}</span><span>Inscrição: ${c.dataInscricao}</span>
          </div>
        </div>
        ${selo ? `<span class="badge ${selo.cls}">${selo.icon||""} ${selo.label}</span>` : ""}
      </div>
      <div class="candidate-motivation">${c.motivacao}</div>
    </div>`;
}

/* ---------- NÚCLEO / LIGA AMPLIADA ---------- */
// Chip reutilizável de "ligante aprovado" (avatar com a inicial + nome), usado tanto na página
// de cada núcleo quanto na de Liga Ampliada — a lista é sempre calculada ao vivo a partir de
// quem já está aprovado no processo seletivo (mesmo princípio do Organograma), nunca salva à
// parte: no instante em que ela aprova alguém em Seleção de Ligantes, a pessoa já aparece aqui.
function membroChipHtml(nome){
  const inicial = (nome || "?").trim().charAt(0);
  return `<span class="membro-chip"><span class="membro-avatar">${escapeHtml(inicial)}</span><b>${escapeHtml(nome)}</b></span>`;
}
function membrosAprovadosCardHtml(nomes, textoVazio){
  return `
    <div class="card">
      <div class="card-header-row"><h2>Ligantes Aprovados</h2></div>
      <div class="membros-row">
        ${nomes.length ? nomes.map(membroChipHtml).join("") : `<span class="membro-vazio">${textoVazio}</span>`}
      </div>
    </div>`;
}
async function renderNucleoPage(n){
  const certs = LAPSIA_DB.certificados.filter(c => c.nucleo === n.nome);
  const candidatos = LAPSIA_DB.candidatosCuradoria.filter(c => c.opcao === n.nome).length;
  const presencaMedia = certs.length ? Math.round(certs.reduce((s,c)=>s+c.frequencia,0)/certs.length) : 0;
  const certPendentes = certs.filter(c=>c.status==="aguardando").length;
  const certEmitidos = certs.filter(c=>c.status==="emitido").length;
  const curadoria = await fetchCuradoria();
  const aprovados = curadoria.filter(c => c.opcao === n.nome && etapaProcessoLigante(c).etapa === "aprovado_final_nucleo").map(c=>c.nome);

  const stats = [
    {icon:ICON.users, color:"#3b82f6", bg:"#eff6ff", value:candidatos, label:"Candidatos"},
    {icon:ICON.calendarCheck, color:"#16a34a", bg:"#f0fdf4", value:presencaMedia+"%", label:"Presença média"},
    {icon:ICON.award, color:"#f59e0b", bg:"#fffbeb", value:certPendentes, label:"Cert. pendentes"},
    {icon:ICON.ribbon, color:"#16a34a", bg:"#f0fdf4", value:certEmitidos, label:"Cert. emitidos"},
  ];
  const statsHtml = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.bg}">${s.icon.replace('stroke-width="2"', `stroke-width="2" stroke="${s.color}"`)}</div>
      <div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>
    </div>`).join("");

  return `
    <div class="page-header">
      <div class="title-row"><h1>Núcleo ${n.nome}</h1>${demoBadge()}</div>
      <div class="subtitle">${n.descricao}</div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);">${statsHtml}</div>
    <div class="card-row card-row-2">
      <div class="card">
        <h3>${ICON.clipboard} Responsabilidades do Núcleo</h3>
        <ul class="check-list">${n.responsabilidades.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3>${ICON.shieldUser} Critérios de Permanência</h3>
        <ul class="check-list">${n.criterios.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
    </div>
    ${membrosAprovadosCardHtml(aprovados, "Nenhum ligante aprovado ainda neste núcleo.")}
    <div class="card">
      <div class="card-header-row"><h2>Encontros do Núcleo</h2></div>
      ${n.encontros.map(e => `
        <div class="meeting-row">
          <div class="meeting-num">${e.numero}</div>
          <div class="meeting-title">${e.titulo}</div>
        </div>`).join("")}
    </div>
  `;
}
// Módulo de Liga Ampliada — pedido dela: um módulo próprio abaixo dos modelos de núcleo,
// com a mesma estrutura de página (responsabilidades, critérios, encontros) e, igual aos
// núcleos, a lista de ligantes já aprovados nela.
async function renderLigaAmpliadaPage(la){
  const certs = LAPSIA_DB.certificados.filter(c => c.nucleo === la.nome);
  const candidatos = LAPSIA_DB.candidatosCuradoria.filter(c => c.opcao === la.nome).length;
  const presencaMedia = certs.length ? Math.round(certs.reduce((s,c)=>s+c.frequencia,0)/certs.length) : 0;
  const certPendentes = certs.filter(c=>c.status==="aguardando").length;
  const certEmitidos = certs.filter(c=>c.status==="emitido").length;
  const curadoria = await fetchCuradoria();
  const aprovados = curadoria.filter(c => c.opcao === la.nome && etapaProcessoLigante(c).etapa === "aprovado_final_liga").map(c=>c.nome);

  const stats = [
    {icon:ICON.users, color:"#3b82f6", bg:"#eff6ff", value:candidatos, label:"Candidatos"},
    {icon:ICON.calendarCheck, color:"#16a34a", bg:"#f0fdf4", value:presencaMedia+"%", label:"Presença média"},
    {icon:ICON.award, color:"#f59e0b", bg:"#fffbeb", value:certPendentes, label:"Cert. pendentes"},
    {icon:ICON.ribbon, color:"#16a34a", bg:"#f0fdf4", value:certEmitidos, label:"Cert. emitidos"},
  ];
  const statsHtml = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.bg}">${s.icon.replace('stroke-width="2"', `stroke-width="2" stroke="${s.color}"`)}</div>
      <div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>
    </div>`).join("");

  return `
    <div class="page-header">
      <div class="title-row"><h1>${la.nome}</h1>${demoBadge()}</div>
      <div class="subtitle">${la.descricao}</div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);">${statsHtml}</div>
    <div class="card-row card-row-2">
      <div class="card">
        <h3>${ICON.clipboard} Responsabilidades</h3>
        <ul class="check-list">${la.responsabilidades.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
      <div class="card">
        <h3>${ICON.shieldUser} Critérios de Permanência</h3>
        <ul class="check-list">${la.criterios.map(r=>`<li>${ICON.check}<span>${r}</span></li>`).join("")}</ul>
      </div>
    </div>
    ${membrosAprovadosCardHtml(aprovados, "Nenhum ligante aprovado ainda na Liga Ampliada.")}
    <div class="card">
      <div class="card-header-row"><h2>Encontros da Liga Ampliada</h2></div>
      ${la.encontros.map(e => `
        <div class="meeting-row">
          <div class="meeting-num">${e.numero}</div>
          <div class="meeting-title">${e.titulo}</div>
        </div>`).join("")}
    </div>
  `;
}

/* ---------- SUBMÓDULOS ---------- */
async function renderSubmodulePage(d, sm){
  let inner;
  if(sm.id === "cronograma") inner = await renderCronogramaPage();
  else if(sm.id === "selecao-diretores") inner = await renderSelecaoDiretoresPage();
  else if(sm.id === "selecao-ligantes") inner = await renderSelecaoLigantesPage();
  else if(sm.id === "presenca") inner = await renderFrequenciaPage();
  else if(sm.id === "certificados") inner = await renderCertificadosPage();
  else if(sm.id === "feedback") inner = await renderFeedbackPage();
  else if(sm.id === "agendamento-sala") inner = renderAgendamentoSalaPage();
  else inner = renderPlaceholderPage(sm.nome);
  return submoduleShell(d) + inner;
}

// Cabeçalho de contexto (nome da diretoria) + link de volta, no topo de todo submódulo
function submoduleShell(d){
  return `
    <div class="mini-header">
      <div class="mini-header-icon">${ICON.brain}</div>
      <div>
        <div class="mini-header-title">${d.nome} <span class="badge badge-demo">Dados de exemplo</span></div>
        <div class="mini-header-sub">Área específica da diretoria</div>
      </div>
    </div>
    <div class="back-link" onclick="navigate({type:'diretoria', id:'${d.id}'})">${ICON.arrowLeft}<span>Voltar para a visão da diretoria</span></div>`;
}

// Célula reutilizável de "agendar entrevista" (Seleção de Diretores/Ligantes)
function entrevistaCellHtml(valorIso, onchangeExpr){
  return `<input type="datetime-local" class="entrevista-input" value="${valorIso||''}" onchange="${onchangeExpr}">`;
}
// Célula reutilizável de "resultado da entrevista" (Aprovado/Reprovado), ao lado do agendamento
function resultadoEntrevistaCellHtml(valor, onchangeExpr){
  return `<select class="resultado-select" onchange="${onchangeExpr}">
    <option value="" ${!valor?'selected':''}>Pendente</option>
    <option value="aprovado" ${valor==='aprovado'?'selected':''}>Aprovado</option>
    <option value="reprovado" ${valor==='reprovado'?'selected':''}>Reprovado</option>
  </select>`;
}

function renderPlaceholderPage(nome){
  return `
    <div class="page-header"><div class="title-row"><h1>${nome}</h1></div></div>
    <div class="placeholder-page">
      ${ICON.calendarPlus}
      <h3>Módulo ainda a definir</h3>
      <p>Este submódulo ainda não teve seu funcionamento validado com a diretoria. Nada aqui deve ser considerado implementado — quando o formato for decidido, esta página passa a consumir dados reais.</p>
    </div>`;
}

/* ---------- CRONOGRAMA ---------- */
async function renderCronogramaPage(){
  const encontros = await fetchCronogramaEncontros();
  return `
    <div class="page-header">
      <div class="title-row"><h1>Cronograma</h1>${demoBadge()}</div>
      <div class="subtitle">Grade de encontros da LAPSIA</div>
    </div>
    <div class="card">
      <h3>${ICON.upload} Calendários de referência</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${uploadButtonHtml('faculdade','Calendário da faculdade')}
        ${uploadButtonHtml('nucleos','Calendário dos núcleos')}
        ${uploadButtonHtml('geral','Calendário geral')}
      </div>
    </div>
    <div class="filter-bar" style="margin-top:22px;">
      <div class="tab-toggle">
        <button type="button" class="${CRONO_TAB==='grade'?'active':''}" onclick="setCronoTab('grade')">Grade</button>
        <button type="button" class="${CRONO_TAB==='linha'?'active':''}" onclick="setCronoTab('linha')">Linha do tempo</button>
      </div>
      <select onchange="setCronoFiltro('opcao', this.value)">
        <option value="Todas" ${CRONO_FILTRO_OPCAO==='Todas'?'selected':''}>Todas as opções</option>
        ${Object.keys(OPCOES_CONFIG).map(o=>`<option value="${o}" ${CRONO_FILTRO_OPCAO===o?'selected':''}>${o}</option>`).join("")}
      </select>
      <select onchange="setCronoFiltro('turno', this.value)">
        <option value="Todos" ${CRONO_FILTRO_TURNO==='Todos'?'selected':''}>Todos os turnos</option>
        <option value="Matutino" ${CRONO_FILTRO_TURNO==='Matutino'?'selected':''}>Matutino</option>
        <option value="Noturno" ${CRONO_FILTRO_TURNO==='Noturno'?'selected':''}>Noturno</option>
      </select>
    </div>
    <div id="crono-content">${CRONO_TAB==='grade' ? renderCronogramaGrade(encontros) : renderCronogramaLinha(encontros)}</div>`;
}
function uploadButtonHtml(key, label){
  const file = LAPSIA_DB.calendariosReferencia[key];
  return `<div>
    <button type="button" class="upload-btn ${file?'has-file':''}" onclick="document.getElementById('upload-${key}').click()">${ICON.upload}<span>${file ? file : label}</span></button>
    <input type="file" id="upload-${key}" style="display:none" onchange="handleCalendarUpload('${key}', this)">
  </div>`;
}
function setCronoTab(tab){ CRONO_TAB = tab; renderMain(); }
function setCronoFiltro(tipo, valor){
  if(tipo==='opcao') CRONO_FILTRO_OPCAO = valor; else CRONO_FILTRO_TURNO = valor;
  renderMain();
}
// A grade de 15 semanas é o modelo-referência do semestre, igual para todas as opções (não é
// diferenciada por núcleo). Por isso os filtros de opção/turno, aqui, não re-filtram as próprias
// linhas da grade — em vez disso, mostram acima dela quais encontros JÁ DATADOS (cronogramaEncontros)
// batem com o filtro escolhido, como uma prévia da agenda real dentro do modelo semanal.
function renderCronogramaGrade(encontros){
  const filtroAtivo = CRONO_FILTRO_OPCAO !== 'Todas' || CRONO_FILTRO_TURNO !== 'Todos';
  const filtrados = encontros.filter(e =>
    (CRONO_FILTRO_OPCAO==='Todas' || e.opcao===CRONO_FILTRO_OPCAO) &&
    (CRONO_FILTRO_TURNO==='Todos' || e.turno===CRONO_FILTRO_TURNO)
  );
  const resumoHtml = !filtroAtivo ? "" : `
    <div class="card" style="margin-bottom:22px;">
      <h3>${ICON.calendarCheck} Encontros agendados para o filtro selecionado</h3>
      ${filtrados.length ? `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${filtrados.map(e => {
            const dt = new Date(e.data+"T00:00:00");
            const dataFmt = dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
            return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;">
              <span class="badge badge-teal">${dataFmt}</span>
              <span class="badge badge-gray">${e.opcao}</span>
              <span class="badge badge-gray">${e.turno}</span>
              <span style="color:var(--text-700);">${e.titulo}</span>
            </div>`;
          }).join("")}
        </div>` : `<div class="empty-state" style="padding:16px 0;">Nenhum encontro datado ainda para este filtro — a grade abaixo é o modelo geral, válido para todas as opções.</div>`}
    </div>`;
  const rows = LAPSIA_DB.cronograma.map(r => `
    <tr>
      <td><b style="color:var(--text-900)">${r.semana}</b></td>
      <td>${r.base}</td>
      <td>${r.nucleos}</td>
      <td>${r.diretoria}</td>
    </tr>`).join("");
  return resumoHtml + `
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="subtitle" style="padding:16px 16px 0;">Estrutura semanal do semestre (15 semanas), conforme o Plano Estratégico 2026 — mesmo modelo para todas as opções, ainda não amarrada a datas de calendário reais.</div>
      <div class="table-scroll" style="border:none;margin-top:12px;">
        <table>
          <thead><tr><th>Semana</th><th>Base coletiva</th><th>Núcleos</th><th>Diretoria</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}
function renderCronogramaLinha(encontros){
  const filtered = encontros.filter(e =>
    (CRONO_FILTRO_OPCAO==='Todas' || e.opcao===CRONO_FILTRO_OPCAO) &&
    (CRONO_FILTRO_TURNO==='Todos' || e.turno===CRONO_FILTRO_TURNO)
  );
  if(!filtered.length) return `<div class="card"><div class="empty-state">Nenhum encontro para os filtros selecionados.</div></div>`;
  return `<div class="card">` + filtered.map(e => {
    const dt = new Date(e.data+"T00:00:00");
    const dia = dt.getDate().toString().padStart(2,'0');
    const mes = dt.toLocaleDateString('pt-BR',{month:'short'}).replace('.','');
    const diaSemana = dt.toLocaleDateString('pt-BR',{weekday:'long'});
    return `
      <div class="timeline-item">
        <div class="timeline-date"><b>${dia}</b><span>${mes}</span></div>
        <div class="timeline-card">
          <div class="timeline-chip-row">
            <span class="badge badge-teal">${e.opcao}</span>
            <span class="badge badge-gray">${e.turno}</span>
            <span class="badge badge-gray" style="text-transform:capitalize;">${diaSemana}</span>
          </div>
          <div class="timeline-title">${e.titulo}</div>
          <div class="timeline-meta">
            <span>${ICON.clock}${e.inicio}–${e.fim}</span>
            <span>${ICON.pin}${e.sala}</span>
            <span>${ICON.person}${e.responsavel}</span>
          </div>
        </div>
      </div>`;
  }).join("") + `</div>`;
}

/* ---------- SELEÇÃO DE DIRETORES ---------- */
function allCandidatosDiretores(){
  return LAPSIA_DB.diretorias.flatMap(d => d.candidatosInscritos.map(c => ({...c, diretoriaId:d.id, diretoriaNome:d.nome})));
}
async function renderSelecaoDiretoresPage(){
  await fetchDiretorias(); // popula LAPSIA_DB.diretorias[].candidatosInscritos com dado real (ao vivo)
  const statsHtml = LAPSIA_DB.diretorias.map(dd => `
    <div class="stat-card-simple">
      <div class="ssc-label">${dd.nome}</div>
      <div class="ssc-value">${dd.candidatosInscritos.length} candidato${dd.candidatosInscritos.length!==1?'s':''}</div>
    </div>`).join("");
  return `
    <div class="page-header"><div class="title-row"><h1>Seleção de Diretores</h1>${demoBadge()}</div>
      <div class="subtitle">Candidatos de exemplo às diretorias da LAPSIA</div></div>
    <div class="stat-grid-simple">${statsHtml}</div>
    <div class="filter-bar" style="justify-content:space-between;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div class="filter-search">${ICON.search}<input type="text" placeholder="Buscar candidato..." value="${SELDIR_BUSCA}" oninput="setSeldirFiltro('busca', this.value)"></div>
        <select onchange="setSeldirFiltro('diretoria', this.value)">
          <option value="Todas" ${SELDIR_DIRETORIA==='Todas'?'selected':''}>Todas as diretorias</option>
          ${LAPSIA_DB.diretorias.map(dd=>`<option value="${dd.id}" ${SELDIR_DIRETORIA===dd.id?'selected':''}>${dd.nome}</option>`).join("")}
        </select>
        <select onchange="setSeldirFiltro('turno', this.value)">
          <option value="Todos" ${SELDIR_TURNO==='Todos'?'selected':''}>Todos os turnos</option>
          <option value="Matutino" ${SELDIR_TURNO==='Matutino'?'selected':''}>Matutino</option>
          <option value="Noturno" ${SELDIR_TURNO==='Noturno'?'selected':''}>Noturno</option>
        </select>
        <select onchange="setSeldirFiltro('semestre', this.value)">
          <option value="2025.2" ${SELDIR_SEMESTRE==='2025.2'?'selected':''}>2025.2</option>
          <option value="2026.1" ${SELDIR_SEMESTRE==='2026.1'?'selected':''}>2026.1</option>
          <option value="2026.2" ${SELDIR_SEMESTRE==='2026.2'?'selected':''}>2026.2</option>
        </select>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll"><table>
        <thead><tr><th>Candidato</th><th>Diretoria</th><th>Período</th><th>Turno</th><th>Selo de apoio</th><th>Processo</th><th></th></tr></thead>
        <tbody id="seldir-tbody">${renderSeldirRows(allCandidatosDiretores())}</tbody>
      </table></div>
    </div>`;
}
// Badge de situação do fluxo de Diretores (agendamento → entrevista → devolutiva) —
// mesma lógica usada no painel "Abrir", ver etapaProcessoDiretor().
const ETAPA_BADGE_DIRETOR = {
  aguardando_agendamento:{label:"Aguardando agendamento", cls:"badge-yellow"},
  aguardando_resultado:{label:"Entrevista agendada", cls:"badge-yellow"},
  aprovado_diretoria:{label:"Aprovado", cls:"badge-green"},
  reprovado_diretoria:{label:"Não aprovado", cls:"badge-red"}
};
function renderSeldirRows(todos){
  const filtered = todos.filter(c => {
    if(SELDIR_DIRETORIA!=='Todas' && c.diretoriaId!==SELDIR_DIRETORIA) return false;
    if(SELDIR_TURNO!=='Todos' && c.turno!==SELDIR_TURNO) return false;
    if(SELDIR_BUSCA && !c.nome.toLowerCase().includes(SELDIR_BUSCA.toLowerCase())) return false;
    return true;
  });
  if(!filtered.length) return `<tr><td colspan="7" class="empty-state">Nenhum candidato encontrado.</td></tr>`;
  return filtered.map(c => {
    const selo = computeSelo(c.diretoriaId, c.motivacao) || (c.seloManual ? {label:c.seloManual, cls:"badge-green", icon:ICON.thumbsUp} : {label:"—", cls:"badge-gray", icon:""});
    const b = ETAPA_BADGE_DIRETOR[etapaProcessoDiretor(c)];
    return `<tr>
      <td class="cand-name-cell"><b>${c.nome}</b><div class="sub">${c.email}</div><div class="motivacao">${c.motivacao}</div></td>
      <td><span class="badge badge-teal">${c.diretoriaNome}</span></td>
      <td>${c.periodo}</td>
      <td>${c.turno}</td>
      <td><span class="badge ${selo.cls}">${selo.icon||""} ${selo.label}</span></td>
      <td><span class="badge ${b.cls}">${b.label}</span></td>
      <td><button class="btn" onclick="openEvalModalDiretor('${c.diretoriaId}','${c.email}')">Abrir</button></td>
    </tr>`;
  }).join("");
}
function setSeldirFiltro(tipo, valor){
  if(tipo==='busca') SELDIR_BUSCA = valor;
  else if(tipo==='diretoria') SELDIR_DIRETORIA = valor;
  else if(tipo==='turno') SELDIR_TURNO = valor;
  else if(tipo==='semestre') SELDIR_SEMESTRE = valor;
  const tbody = document.getElementById("seldir-tbody");
  if(tbody) tbody.innerHTML = renderSeldirRows(allCandidatosDiretores());
}

/* ---------- ORGANOGRAMA ---------- */
// Estrutura organizacional montada ao vivo a partir de quem já foi aprovado no processo
// seletivo: diretores aprovados (Seleção de Diretores) e ligantes aprovados (Seleção de
// Ligantes, seja em núcleo ou na Liga Ampliada) aparecem aqui automaticamente — sem nenhuma
// ação manual dela além de marcar o resultado no painel de avaliação de cada um.
// Uma "caixa" da árvore: título + (opcional) linha de subtítulo, já usada tanto pros nós de
// diretoria/núcleo/liga quanto pro nó raiz (sem subtítulo).
function ocNode(cls, titulo, subtitleHtml){
  return `<div class="oc-node ${cls}"><div class="oc-node-title">${titulo}</div>${subtitleHtml ? `<div class="oc-node-sub">${subtitleHtml}</div>` : ""}</div>`;
}
// Folha de pessoa (diretor(a)/ligante aprovado): avatar com a inicial do nome + nome.
function ocPessoa(nome){
  const inicial = (nome || "?").trim().charAt(0);
  return `<div class="oc-node oc-pessoa"><span class="oc-avatar">${escapeHtml(inicial)}</span><span class="oc-pessoa-nome">${escapeHtml(nome)}</span></div>`;
}
function ocVaga(texto){
  return `<div class="oc-node oc-vaga">${texto}</div>`;
}
// Uma fileira de folhas (pessoas aprovadas) sob um núcleo/Liga Ampliada; quando ainda não há
// nenhuma, mostra uma única folha de "vaga" tracejada, pra deixar claro que o ramo existe mas
// está vazio, em vez de simplesmente não desenhar nada.
function ocLeafRow(nomes, textoVazio){
  const itens = nomes.length
    ? nomes.map(nome => `<li>${ocPessoa(nome)}</li>`).join("")
    : `<li>${ocVaga(textoVazio)}</li>`;
  return `<ul class="oc-level">${itens}</ul>`;
}

// Organograma: árvore ao vivo (LAPSIA → Diretoria → Núcleo → Ligantes, + Liga Ampliada como
// ramo à parte, sem núcleo), recalculada a cada visita a partir de quem já está aprovado —
// não existe nenhum estado próprio salvo, então a pessoa aparece aqui no instante em que o
// status dela vira aprovado em Seleção de Diretores/Ligantes.
async function renderOrganogramaPage(){
  const diretorias = await fetchDiretorias();
  const candidatosLigantes = await fetchCuradoria();

  const diretoriasLis = diretorias.map(d => {
    const aprovados = d.candidatosInscritos.filter(c => etapaProcessoDiretor(c) === "aprovado_diretoria").map(c => c.nome);
    const subtitle = aprovados.length
      ? aprovados.map(nome => escapeHtml(nome)).join(" · ")
      : `<span class="oc-vaga-inline">Vaga em aberto</span>`;
    const nodeHtml = ocNode("oc-diretoria", escapeHtml(d.nome), subtitle);

    // Só a Diretoria Acadêmica "governa" os núcleos temáticos na estrutura da liga.
    let filhosHtml = "";
    if(d.id === "academica"){
      const nucleosLis = LAPSIA_DB.nucleos.map(n => {
        const membros = candidatosLigantes
          .filter(c => c.opcao === n.nome && etapaProcessoLigante(c).etapa === "aprovado_final_nucleo")
          .map(c => c.nome);
        const coordenador = (MSG_CONFIG.coordenadores[n.id] || "").trim();
        const coordSubtitle = `Coordenador(a): ${coordenador ? escapeHtml(coordenador) : '<span class="oc-vaga-inline">a definir</span>'}`;
        const nucleoNode = ocNode("oc-nucleo", `Núcleo de ${escapeHtml(n.nome)}`, coordSubtitle);
        return `<li>${nucleoNode}${ocLeafRow(membros, "Nenhum ligante aprovado ainda")}</li>`;
      }).join("");
      filhosHtml = `<ul class="oc-level">${nucleosLis}</ul>`;
    }
    return `<li>${nodeHtml}${filhosHtml}</li>`;
  }).join("");

  const ligaAmpliadaNomes = candidatosLigantes.filter(c => etapaProcessoLigante(c).etapa === "aprovado_final_liga").map(c => c.nome);
  const ligaSubtitle = ligaAmpliadaNomes.length
    ? `${ligaAmpliadaNomes.length} ligante${ligaAmpliadaNomes.length !== 1 ? "s" : ""} aprovado${ligaAmpliadaNomes.length !== 1 ? "s" : ""}`
    : `<span class="oc-vaga-inline">Nenhum ligante ainda</span>`;
  const ligaAmpliadaLi = `<li>${ocNode("oc-liga", "Liga Ampliada", ligaSubtitle)}${ocLeafRow(ligaAmpliadaNomes, "Nenhum ligante aprovado ainda")}</li>`;

  return `
    <div class="page-header"><div class="title-row"><h1>Organograma</h1>${demoBadge()}</div>
      <div class="subtitle">Estrutura organizacional da LAPSIA — atualizada automaticamente conforme diretores e ligantes vão sendo aprovados no processo seletivo</div></div>
    <div class="oc-legend">
      <span><i style="background:var(--navy-800);"></i>LAPSIA</span>
      <span><i style="background:var(--teal-500);"></i>Diretoria</span>
      <span><i style="background:#8b5cf6;"></i>Núcleo</span>
      <span><i style="background:var(--green-500);"></i>Liga Ampliada</span>
      <span><i style="border:1px dashed var(--border-strong);"></i>Vaga em aberto</span>
    </div>
    <div class="orgchart-scroll"><div class="orgchart">
      ${ocNode("oc-root", "LAPSIA")}
      <ul class="oc-level oc-level-top">
        ${diretoriasLis}
        ${ligaAmpliadaLi}
      </ul>
    </div></div>`;
}

/* ---------- SELEÇÃO DE LIGANTES ---------- */
async function renderSelecaoLigantesPage(){
  const candidatos = await fetchCuradoria();
  const statsHtml = Object.keys(OPCOES_CONFIG).map(op => {
    const n = candidatos.filter(c=>c.opcao===op).length;
    return `<div class="stat-card-simple"><div class="ssc-label">${op}</div><div class="ssc-value">${n} candidato${n!==1?'s':''}</div></div>`;
  }).join("");
  return `
    <div class="page-header"><div class="title-row"><h1>Seleção de Ligantes</h1></div>
      <div class="subtitle">Candidatos inscritos — ${SELLIG_SEMESTRE}</div></div>
    <div class="stat-grid-simple" style="grid-template-columns:repeat(4,1fr);">${statsHtml}</div>
    <div class="filter-bar" style="justify-content:space-between;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div class="filter-search">${ICON.search}<input type="text" placeholder="Buscar candidato..." value="${SELLIG_BUSCA}" oninput="setSelligFiltro('busca', this.value)"></div>
        <select onchange="setSelligFiltro('opcao', this.value)">
          <option value="Todas" ${SELLIG_OPCAO==='Todas'?'selected':''}>Todas as opções</option>
          ${Object.keys(OPCOES_CONFIG).map(o=>`<option value="${o}" ${SELLIG_OPCAO===o?'selected':''}>${o}</option>`).join("")}
        </select>
        <select onchange="setSelligFiltro('turno', this.value)">
          <option value="Todos" ${SELLIG_TURNO==='Todos'?'selected':''}>Todos os turnos</option>
          <option value="Matutino" ${SELLIG_TURNO==='Matutino'?'selected':''}>Matutino</option>
          <option value="Noturno" ${SELLIG_TURNO==='Noturno'?'selected':''}>Noturno</option>
        </select>
        <select onchange="setSelligFiltro('semestre', this.value)">
          <option value="2025.2" ${SELLIG_SEMESTRE==='2025.2'?'selected':''}>2025.2</option>
          <option value="2026.1" ${SELLIG_SEMESTRE==='2026.1'?'selected':''}>2026.1</option>
          <option value="2026.2" ${SELLIG_SEMESTRE==='2026.2'?'selected':''}>2026.2</option>
        </select>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll"><table>
        <thead><tr><th>Candidato</th><th>Opção</th><th>Período</th><th>Turno</th><th>Inscrição</th><th>Situação</th><th></th></tr></thead>
        <tbody id="sellig-tbody">${renderSelligRows(candidatos)}</tbody>
      </table></div>
    </div>`;
}
// Badge de situação do fluxo completo (rubrica → agendamento → entrevista → devolutiva),
// a mesma lógica usada no painel de "Avaliar/Revisar" — ver etapaProcessoLigante().
const ETAPA_BADGE = {
  rubrica_pendente:{label:"Rubrica pendente", cls:"badge-yellow"},
  reprovado_rubrica:{label:"Não aprovado (rubrica)", cls:"badge-red"},
  aguardando_agendamento:{label:"Aguardando agendamento", cls:"badge-yellow"},
  aguardando_resultado:{label:"Entrevista agendada", cls:"badge-yellow"},
  aprovado_final_liga:{label:"Aprovado", cls:"badge-green"},
  aprovado_final_nucleo:{label:"Aprovado", cls:"badge-green"},
  reprovado_final_nucleo:{label:"Não aprovado", cls:"badge-red"}
};
function renderSelligRows(candidatos){
  const filtered = candidatos.filter(c=>{
    if(SELLIG_OPCAO!=='Todas' && c.opcao!==SELLIG_OPCAO) return false;
    if(SELLIG_TURNO!=='Todos' && c.turno!==SELLIG_TURNO) return false;
    if(SELLIG_BUSCA && !c.nome.toLowerCase().includes(SELLIG_BUSCA.toLowerCase())) return false;
    return true;
  });
  if(!filtered.length) return `<tr><td colspan="7" class="empty-state">Nenhum candidato encontrado.</td></tr>`;
  return filtered.map(c => {
    const info = etapaProcessoLigante(c);
    const b = ETAPA_BADGE[info.etapa];
    return `
    <tr>
      <td class="cand-name-cell"><b>${c.nome}</b><div class="sub">${c.email}</div><div class="motivacao">${c.motivacaoTexto}</div></td>
      <td><span class="badge badge-teal">${c.opcao}</span></td>
      <td>${c.periodo}</td>
      <td>${c.turno}</td>
      <td>${c.dataInscricao}</td>
      <td><span class="badge ${b.cls}">${b.label}</span></td>
      <td><button class="btn" onclick="openEvalModal('${c.email}')">Abrir</button></td>
    </tr>`;}).join("");
}
function setSelligFiltro(tipo, valor){
  if(tipo==='busca') SELLIG_BUSCA = valor;
  else if(tipo==='opcao') SELLIG_OPCAO = valor;
  else if(tipo==='turno') SELLIG_TURNO = valor;
  else if(tipo==='semestre') SELLIG_SEMESTRE = valor;
  fetchCuradoria().then(cs => { const t=document.getElementById("sellig-tbody"); if(t) t.innerHTML = renderSelligRows(cs); });
}

function situacaoCuradoria(c){
  const notasPreenchidas = RUBRICA_CRITERIOS.every(k => c.notas[k] !== null && c.notas[k] !== undefined);
  if(!notasPreenchidas) return {label:"notas pendentes", cls:"badge-yellow", nota:null};
  if(c.etica === "Sim") return {label:"eliminado (ética)", cls:"badge-red", nota: RUBRICA_CRITERIOS.reduce((s,k)=>s+c.notas[k],0)};
  const total = RUBRICA_CRITERIOS.reduce((s,k)=>s+c.notas[k],0);
  const corte = (OPCOES_CONFIG[c.opcao] || {corte:0}).corte;
  return total >= corte ? {label:"elegível", cls:"badge-green", nota:total} : {label:"abaixo do corte", cls:"badge-red", nota:total};
}

/* =============== Fluxo do Processo Seletivo de Ligantes (Inscrição → Rubrica → Agendamento
   → Entrevista → Devolutiva) — só para Ligantes nesta rodada, a pedido dela.
   "Liga Ampliada" não tem etapa de entrevista: aprovação na rubrica já é o resultado final
   (confirmado com ela). Os 3 núcleos (Logoterapia, Morte e Luto, Psicologia Escolar) passam
   por agendamento + entrevista antes da devolutiva. */
function etapaProcessoLigante(c){
  const s = situacaoCuradoria(c);
  if(s.label === "notas pendentes") return {etapa:"rubrica_pendente", situacao:s};
  if(s.label !== "elegível") return {etapa:"reprovado_rubrica", situacao:s}; // abaixo do corte OU eliminado por ética
  if(c.opcao === "Liga Ampliada") return {etapa:"aprovado_final_liga", situacao:s}; // sem entrevista
  if(!c.resultadoEntrevista) return {etapa: c.entrevista ? "aguardando_resultado" : "aguardando_agendamento", situacao:s};
  if(c.resultadoEntrevista === "aprovado") return {etapa:"aprovado_final_nucleo", situacao:s};
  return {etapa:"reprovado_final_nucleo", situacao:s};
}
const PIPELINE_LABELS = {
  rubrica_pendente:"Rubrica", reprovado_rubrica:"Rubrica", aguardando_agendamento:"Agendamento",
  aguardando_resultado:"Entrevista", aprovado_final_nucleo:"Devolutiva", reprovado_final_nucleo:"Devolutiva",
  aprovado_final_liga:"Devolutiva"
};
function pipelineStepsHtml(etapaAtual, opcao){
  const semEntrevista = opcao === "Liga Ampliada";
  const passos = semEntrevista
    ? [["rubrica_pendente","Rubrica"],["_devolutiva","Devolutiva"]]
    : [["rubrica_pendente","Rubrica"],["aguardando_agendamento","Agendamento"],["aguardando_resultado","Entrevista"],["_devolutiva","Devolutiva"]];
  const ordem = ["rubrica_pendente","aguardando_agendamento","aguardando_resultado","_devolutiva"];
  const atualIdx = etapaAtual.startsWith("aprovado_final") || etapaAtual.startsWith("reprovado_final") || etapaAtual==="reprovado_rubrica"
    ? ordem.indexOf("_devolutiva")
    : ordem.indexOf(etapaAtual);
  return `<div class="pipeline-steps">${passos.map(([key,label]) => {
    const idx = ordem.indexOf(key);
    let cls = "pipeline-step";
    if(idx < atualIdx) cls += " done";
    else if(idx === atualIdx) cls += (etapaAtual.startsWith("reprovado") ? " blocked" : " current");
    return `<span class="${cls}">${label}</span>`;
  }).join("")}</div>`;
}

// Inferência de gênero pelo primeiro nome, só para flexionar as mensagens de devolutiva dos
// Ligantes (aprovado/aprovada, bem-vindo/bem-vinda etc.) sem precisar perguntar o gênero no
// formulário. Nome não é garantia de gênero, então isto é uma heurística — primeiro confere
// contra duas listas de nomes comuns em português, e só cai numa terminação genérica (menos
// confiável) se o nome não estiver em nenhuma das duas. Quando não dá pra saber, a mensagem
// usa a forma neutra "(a)" de sempre (ex.: "aprovado(a)"), então nunca fica errado — só neutro.
const NOMES_FEMININOS_COMUNS = new Set([
  "ana","maria","beatriz","camila","carla","carolina","claudia","cristina","diana","elaine",
  "eliane","fernanda","gabriela","helena","isabela","isabella","joana","juliana","julia",
  "larissa","laura","leticia","luana","luiza","luisa","manuela","marcela","marina","mariana",
  "natalia","patricia","paula","priscila","rafaela","raquel","renata","sabrina","sara","sarah",
  "sofia","sophia","talita","tatiana","valentina","vanessa","vitoria","viviane","yasmin",
  "amanda","bruna","bianca","daniela","debora","erika","flavia","giovanna","ingrid","jessica",
  "karina","livia","monica","nayara","roberta","simone","suellen","thais"
]);
const NOMES_MASCULINOS_COMUNS = new Set([
  "joao","jose","pedro","paulo","lucas","gabriel","gustavo","rafael","rodrigo","bruno",
  "diego","thiago","tiago","matheus","mateus","felipe","filipe","carlos","marcelo","marcos",
  "fernando","ricardo","eduardo","henrique","igor","daniel","david","davi","vinicius",
  "leonardo","alexandre","andre","antonio","bernardo","caio","cesar","douglas","erick",
  "fabio","guilherme","heitor","jorge","julio","luan","luiz","marcio","miguel",
  "murilo","nicolas","otavio","raul","renan","robson","samuel","sergio","victor","vitor","wesley","william"
]);
function inferirGeneroPeloNome(nomeCompleto){
  const primeiro = String(nomeCompleto||"").trim().split(/\s+/)[0]
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if(!primeiro) return null;
  if(NOMES_FEMININOS_COMUNS.has(primeiro)) return "f";
  if(NOMES_MASCULINOS_COMUNS.has(primeiro)) return "m";
  // Terminação comum em português — imperfeita (há exceções como "Nicolas"), por isso só
  // entra em jogo quando o nome não está em nenhuma das duas listas acima.
  if(/a$/.test(primeiro)) return "f";
  if(/(o|os|el|ael|ique|ando|erto|ico|son|or)$/.test(primeiro)) return "m";
  return null;
}
// Escolhe a forma certa da palavra pelo gênero inferido do nome; sem gênero identificado, cai
// na forma neutra "(a)" que a mensagem sempre usou (ex.: masc="aprovado" → "aprovado(a)").
function porGenero(nomeCompleto, masc, fem){
  const g = inferirGeneroPeloNome(nomeCompleto);
  if(g === "f") return fem;
  if(g === "m") return masc;
  return masc + "(a)";
}
// Primeiro nome da pessoa — pedido dela (24/08/2026): as mensagens (as que são copiadas/enviadas
// pra fora, não os textos internos do painel) devem chamar a pessoa só pelo primeiro nome, nunca
// pelo nome completo.
function primeiroNome(nomeCompleto){
  return String(nomeCompleto||"").trim().split(/\s+/)[0] || "";
}

/* ---- Templates de mensagem (adaptados do documento oficial "Processos Padrão — Diretoria
   Administrativa"), com o link de agendamento substituindo o horário fixo combinado antes. ---- */
function msgReprovacaoRubrica(c){
  return {
    assunto: "Retorno sobre sua inscrição na LAPSIA",
    corpo: `Olá, ${primeiroNome(c.nome)}!\n\n`+
      `Agradecemos muito pelo seu interesse em fazer parte da LAPSIA e pela dedicação ao longo desta primeira etapa do nosso processo seletivo.\n\n`+
      `Após a avaliação da Rubrica, nossa 1ª etapa de avaliação, informamos que, neste momento, você não foi ${porGenero(c.nome,"selecionado","selecionada")} para seguir para a próxima etapa do processo seletivo do ${c.opcao}.\n\n`+
      `Sabemos que participar de um processo seletivo envolve expectativa e disponibilidade, por isso queremos reforçar que essa decisão se refere exclusivamente aos critérios estabelecidos para esta seleção e não diminui o valor da sua participação e do seu interesse pela Liga.\n\n`+
      `Ao longo do período, teremos palestras, atividades abertas, eventos, projetos e outras iniciativas direcionadas aos alunos, e ficaremos muito felizes em contar com a sua presença e participação nesses momentos.\n\n`+
      `Agradecemos novamente pelo interesse e desejamos muito sucesso na sua trajetória acadêmica!\n\nAbraços,\n${MSG_CONFIG.remetente}`
  };
}
function msgAgendamentoNucleo(c){
  const nucleoId = OPCAO_TO_NUCLEO_ID[c.opcao];
  const coordenador = (MSG_CONFIG.coordenadores[nucleoId]||"").trim() || "[NOME DO(A) COORDENADOR(A) — preencha na configuração acima]";
  // Link fixo por núcleo (Revisão 15, ela passou os 3 links e pediu que fossem fixos) — vem do
  // cadastro do próprio núcleo (LAPSIA_DB.nucleos), não mais de MSG_CONFIG.
  const link = LAPSIA_DB.nucleos.find(n => n.id === nucleoId).linkAgendamento;
  return {
    assunto: `Você avançou no processo seletivo da LAPSIA — Núcleo de ${c.opcao}`,
    corpo: `Oii, ${primeiroNome(c.nome)}! Tudo bem?\n\n`+
      `Passando para te dar uma ótima notícia: você foi ${porGenero(c.nome,"pré-aprovado","pré-aprovada")} no processo seletivo da LAPSIA para o Núcleo de ${c.opcao}!\n\n`+
      `Ficamos muito felizes com o seu interesse em fazer parte da Liga e, agora, você seguirá para a próxima etapa do nosso processo seletivo: a entrevista com a coordenação do núcleo.\n\n`+
      `Para escolher o dia e horário que funcionar melhor para você, acesse o link abaixo e selecione um horário disponível:\n${link}\n\n`+
      `Coordenador(a) responsável pela entrevista: ${coordenador}\n`+
      `Modalidade: Online (o link do Google Meet será encaminhado para o seu e-mail através de um convite no Google Agenda, após a confirmação do horário)\n\n`+
      `Pedimos, por gentileza, que confirme o recebimento desta mensagem e realize o agendamento pelo link acima.\n\n`+
      `Estamos muito felizes em ter você avançando no nosso processo seletivo e desejamos uma ótima entrevista!\n\nBoa sorte e até breve!\n${MSG_CONFIG.remetente}`
  };
}
function msgAprovacaoLigaAmpliada(c){
  return {
    assunto: `${porGenero(c.nome,"Bem-vindo","Bem-vinda")} à Liga Ampliada da LAPSIA!`,
    corpo: `Passando para te dar uma ótima notícia: agora você faz parte da Liga Ampliada da LAPSIA! 🎉 Ficamos muito felizes em ter você com a gente!\n\n`+
      `Para começarmos, você será ${porGenero(c.nome,"adicionado","adicionada")} ao grupo da Liga Ampliada, de acordo com o turno informado no Forms (${c.turno}). É por lá que vamos compartilhar as informações sobre o início das atividades, os temas que serão trabalhados e demais orientações, então é importante ficar ${porGenero(c.nome,"atento","atenta")} às mensagens do grupo.\n\n`+
      `Também pedimos que você leia o material com os compromissos do(a) ligante, que vou te encaminhar em seguida.\n\n`+
      `A Liga Ampliada será acompanhada por ${MSG_CONFIG.remetente}, que estará com você ao longo das atividades.\n\n`+
      `Caso tenha qualquer dúvida nesse início ou ao longo da sua participação, pode me procurar! 💚`
  };
}
function msgAprovacaoPosEntrevista(c){
  return {
    assunto: `${porGenero(c.nome,"Bem-vindo","Bem-vinda")} ao Núcleo de ${c.opcao}!`,
    corpo: `Olá, ${primeiroNome(c.nome)}!\n\n`+
      `É com muita alegria que informamos que você foi ${porGenero(c.nome,"aprovado","aprovada")} na etapa de entrevista e, a partir de agora, está oficialmente ${porGenero(c.nome,"integrado","integrada")} ao Núcleo de ${c.opcao} da LAPSIA!\n\n`+
      `Parabéns por essa conquista e seja muito ${porGenero(c.nome,"bem-vindo","bem-vinda")} à nossa Liga! Esperamos que esse novo ciclo seja repleto de aprendizado, trocas, experiências e crescimento.\n\n`+
      `Em breve, você será ${porGenero(c.nome,"adicionado","adicionada")} ao grupo do seu núcleo, onde os(as) coordenadores(as) responsáveis irão repassar todas as orientações, informações importantes e próximos passos para o início das atividades.\n\n`+
      `Estamos muito felizes em ter você conosco.\n\n${porGenero(c.nome,"Bem-vindo","Bem-vinda")} à LAPSIA!`
  };
}
function msgReprovacaoPosEntrevista(c){
  return {
    assunto: `Retorno sobre o processo seletivo — Núcleo de ${c.opcao}`,
    corpo: `Olá, ${primeiroNome(c.nome)}! Tudo bem?\n\n`+
      `Agradecemos muito pelo seu interesse em fazer parte do Núcleo de ${c.opcao} da LAPSIA e pela disponibilidade em participar do nosso processo seletivo.\n\n`+
      `Após a etapa de entrevistas e a avaliação dos candidatos, informamos que, neste momento, você não foi ${porGenero(c.nome,"selecionado","selecionada")} para seguir no processo. Sabemos que receber esse retorno pode ser frustrante, mas queremos reforçar que a decisão foi tomada considerando os critérios e as necessidades atuais do núcleo.\n\n`+
      `Agradecemos pelo tempo, dedicação e interesse demonstrados durante todo o processo. Esperamos que essa experiência tenha sido proveitosa e incentivamos você a continuar acompanhando a LAPSIA e a participar de futuras oportunidades. 💙\n\n`+
      `Desejamos muito sucesso na sua trajetória!\n\nAbraços.`
  };
}
function mensagemParaEtapa(c, etapa){
  if(etapa === "reprovado_rubrica") return msgReprovacaoRubrica(c);
  if(etapa === "aguardando_agendamento") return msgAgendamentoNucleo(c);
  if(etapa === "aprovado_final_liga") return msgAprovacaoLigaAmpliada(c);
  if(etapa === "aprovado_final_nucleo") return msgAprovacaoPosEntrevista(c);
  if(etapa === "reprovado_final_nucleo") return msgReprovacaoPosEntrevista(c);
  return null;
}
// Ações do cartão de mensagem — texto vive num <textarea readonly>, então nunca precisamos
// serializar o conteúdo dentro de um atributo onclick (evita qualquer problema de aspas/quebra
// de linha). O botão de WhatsApp usa o telefone do candidato quando disponível (normalizarTelefoneBr);
// sem telefone cadastrado, abre sem número pré-preenchido e ela escolhe o contato na hora.
function copiarMensagem(id, btn){
  const el = document.getElementById(id);
  if(!el) return;
  el.focus(); el.select();
  const done = () => { if(btn){ const orig = btn.textContent; btn.textContent = "Copiado!"; setTimeout(()=>{btn.textContent = orig;}, 1500); } };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(el.value).then(done).catch(() => { document.execCommand('copy'); done(); });
  } else {
    document.execCommand('copy'); done();
  }
}
function abrirEmailMensagem(email, id){
  const el = document.getElementById(id);
  if(!el) return;
  const assunto = el.getAttribute('data-assunto') || "";
  const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(el.value)}`;
  window.open(url, '_blank');
}
function abrirWhatsappMensagem(id, telefone){
  const el = document.getElementById(id);
  if(!el) return;
  const numero = normalizarTelefoneBr(telefone);
  const base = numero ? `https://wa.me/${numero}` : `https://wa.me/`;
  window.open(`${base}?text=${encodeURIComponent(el.value)}`, '_blank');
}
async function toggleMensagemEnviada(email, etapa, checked){
  await marcarMensagemEnviada(email, etapa, checked);
}
// Card de configuração (link de agendamento, assinatura, coordenador do núcleo) — aparece no
// painel de qualquer candidato para ela poder ajustar sem precisar editar código; vale pra
// todo mundo, fica só em memória (mesma limitação do resto, sem backend ainda).
function configCardHtml(c){
  const nucleoId = OPCAO_TO_NUCLEO_ID[c.opcao];
  // Desde a Revisão 15, o link de agendamento de cada núcleo é fixo (ela pediu) — vem do
  // cadastro do núcleo, não é mais editável aqui; por isso aparece como texto, não como campo.
  const nucleoRows = nucleoId ? `
      <div class="acc-row">
        <label>Link de agendamento — Núcleo de ${c.opcao} (fixo)</label>
        <span class="acc-fixo">${escapeHtml(LAPSIA_DB.nucleos.find(n=>n.id===nucleoId).linkAgendamento)}</span>
      </div>
      <div class="acc-row">
        <label>Coordenador(a) do Núcleo de ${c.opcao}</label>
        <input type="text" value="${escapeHtml(MSG_CONFIG.coordenadores[nucleoId]||'')}" placeholder="Nome de quem entrevista" onchange="setMsgConfig('coordenador:${nucleoId}', this.value)">
      </div>` : "";
  return `
    <div class="agenda-config-card">
      <div class="acc-title">Configuração das mensagens (vale para todos os candidatos nesta sessão)</div>
      <div class="acc-row">
        <label>Assinatura das mensagens (seu nome)</label>
        <input type="text" value="${escapeHtml(MSG_CONFIG.remetente)}" onchange="setMsgConfig('remetente', this.value)">
      </div>
      ${nucleoRows}
    </div>`;
}
function etapaTituloMensagem(etapa){
  const map = {
    reprovado_rubrica:"Devolutiva — não aprovado na rubrica",
    aguardando_agendamento:"Mensagem de aprovação + agendamento da entrevista",
    aprovado_final_liga:"Devolutiva — aprovado (Liga Ampliada)",
    aprovado_final_nucleo:"Devolutiva — aprovado após entrevista",
    reprovado_final_nucleo:"Devolutiva — não aprovado após entrevista"
  };
  return map[etapa] || "Mensagem";
}
// Monta a seção "Etapa do processo" do painel: trilha visual + controles específicos da etapa
// (agendar data, marcar resultado) + o cartão de mensagem pronta pra essa etapa, quando houver.
function etapaSectionHtml(c, info){
  const etapa = info.etapa;
  const trilha = pipelineStepsHtml(etapa, c.opcao);
  if(etapa === "rubrica_pendente"){
    return trilha + `<div class="msg-card-note">Preencha as notas da rubrica acima para liberar a próxima etapa.</div>`;
  }
  let controlesEtapa = "";
  const ETAPAS_NUCLEO = ["aguardando_agendamento","aguardando_resultado","aprovado_final_nucleo","reprovado_final_nucleo"];
  if(ETAPAS_NUCLEO.includes(etapa)){
    // Os dois campos (data/hora da entrevista e resultado) ficam sempre visíveis e editáveis
    // juntos — ela pode marcar aprovado/reprovado a qualquer momento, sem depender de já ter
    // preenchido a data da entrevista antes (mesmo ajuste feito para Diretores).
    controlesEtapa = `
      <div class="obs-field" style="margin-top:2px;">
        <label>Data/hora da entrevista (depois que ela confirmar pelo link de agendamento)</label>
        ${entrevistaCellHtml(c.entrevista, `agendarEntrevistaLigante('${c.email}', this.value).then(()=>openEvalModal('${c.email}'))`)}
      </div>
      <div class="obs-field" style="margin-top:10px;">
        <label>Resultado após a entrevista</label>
        ${resultadoEntrevistaCellHtml(c.resultadoEntrevista, `salvarResultadoEntrevistaLigante('${c.email}', this.value).then(()=>openEvalModal('${c.email}'))`)}
      </div>`;
  }
  const msg = mensagemParaEtapa(c, etapa);
  if(!msg) return trilha + controlesEtapa;
  const variant = etapa.startsWith("reprovado") ? "msg-negative" : (etapa.startsWith("aprovado") ? "msg-positive" : "");
  const notifKey = (etapa === "aguardando_agendamento") ? "agendamento" : "devolutiva";
  const textareaId = "msg-body-" + notifKey;
  // O link já é fixo por núcleo desde a Revisão 15 — só falta o(a) coordenador(a) agora.
  const faltaConfig = etapa === "aguardando_agendamento" && !(MSG_CONFIG.coordenadores[OPCAO_TO_NUCLEO_ID[c.opcao]]||"").trim();
  return `
    ${trilha}
    ${controlesEtapa}
    <div class="msg-card ${variant}">
      <div class="msg-card-head">
        <span class="msg-card-title">${etapaTituloMensagem(etapa)}</span>
        <div class="msg-card-actions">
          <button type="button" class="btn btn-sm" onclick="copiarMensagem('${textareaId}', this)">Copiar</button>
          <button type="button" class="btn btn-sm" onclick="abrirEmailMensagem('${c.email}','${textareaId}')">✉ E-mail</button>
          <button type="button" class="btn btn-sm" onclick="abrirWhatsappMensagem('${textareaId}','${escapeHtml(c.telefone||'')}')">WhatsApp</button>
        </div>
      </div>
      <textarea id="${textareaId}" class="msg-card-body" style="width:100%;min-height:190px;resize:vertical;" readonly data-assunto="${escapeHtml(msg.assunto)}">${msg.corpo}</textarea>
      <div class="msg-card-note">${faltaConfig ? '⚠️ Preencha o(a) coordenador(a) na configuração acima antes de enviar (o link de agendamento já é fixo).' : (c.telefone ? 'O botão de WhatsApp já abre direto na conversa com ' + c.nome + '.' : 'Esse candidato não tem telefone cadastrado — o botão de WhatsApp abre sem número pré-preenchido, você escolhe o contato na hora.')}</div>
      <div class="msg-sent-row">
        <input type="checkbox" id="notif-${notifKey}" ${c.notificado && c.notificado[notifKey]?"checked":""} onchange="toggleMensagemEnviada('${c.email}','${notifKey}', this.checked)">
        <label for="notif-${notifKey}">Já enviei essa mensagem</label>
      </div>
    </div>`;
}

/* =============== Fluxo do Processo Seletivo de Diretores (Inscrição → Agendamento →
   Entrevista → Devolutiva) — igual em espírito ao de Ligantes, mas sem etapa de rubrica:
   o processo de Diretores não tem avaliação por nota, só "selo de apoio" informativo, então
   toda inscrição já sai direto para agendamento da entrevista (confere com o documento oficial
   "Processos Padrão — Diretoria Administrativa", que não tem mensagem de rubrica para Diretores). */
function etapaProcessoDiretor(c){
  if(!c.resultadoEntrevista) return c.entrevista ? "aguardando_resultado" : "aguardando_agendamento";
  return c.resultadoEntrevista === "aprovado" ? "aprovado_diretoria" : "reprovado_diretoria";
}
function pipelineStepsHtmlDiretoria(etapaAtual){
  const passos = [["aguardando_agendamento","Agendamento"],["aguardando_resultado","Entrevista"],["_devolutiva","Devolutiva"]];
  const ordem = ["aguardando_agendamento","aguardando_resultado","_devolutiva"];
  const atualIdx = (etapaAtual.startsWith("aprovado") || etapaAtual.startsWith("reprovado")) ? ordem.indexOf("_devolutiva") : ordem.indexOf(etapaAtual);
  return `<div class="pipeline-steps">${passos.map(([key,label]) => {
    const idx = ordem.indexOf(key);
    let cls = "pipeline-step";
    if(idx < atualIdx) cls += " done";
    else if(idx === atualIdx) cls += (etapaAtual.startsWith("reprovado") ? " blocked" : " current");
    return `<span class="${cls}">${label}</span>`;
  }).join("")}</div>`;
}
/* ---- Templates de mensagem de Diretores (adaptados do documento oficial "Processos Padrão —
   Diretoria Administrativa", seção "Mensagens - DIRETORIA"), com o link de agendamento
   substituindo a data/horário fixos combinados antes — mesmo ajuste feito para os núcleos. ---- */
function msgAgendamentoDiretoria(c){
  const link = (MSG_CONFIG.linkAgendamento||"").trim() || "[LINK DE AGENDAMENTO — preencha na configuração acima]";
  return {
    assunto: `Você avançou no processo seletivo da LAPSIA — Diretoria ${c.diretoriaNome}`,
    corpo: `Oii, ${primeiroNome(c.nome)}! Tudo bem?\n\n`+
      `Meu nome é ${MSG_CONFIG.remetente} e faço parte da Diretoria Administrativa e de Pessoas da LAPSIA.\n\n`+
      `Estou entrando em contato porque você se inscreveu para participar da Diretoria ${c.diretoriaNome} da LAPSIA. Antes de tudo, obrigada pelo interesse em fazer parte da nossa equipe!\n\n`+
      `A próxima etapa do processo seletivo é a entrevista com os diretores responsáveis pela diretoria. Para escolher o dia e horário que funcionar melhor para você, acesse o link abaixo e selecione um horário disponível:\n${link}\n\n`+
      `A entrevista será online. Após a confirmação, você receberá um convite na sua agenda com o link do Google Meet para participar.\n\n`+
      `Também vou te enviar um material com mais informações sobre as atividades da Diretoria, para que você possa conhecer um pouco melhor a área antes da entrevista.\n\n`+
      `Se surgir qualquer dúvida, fique à vontade para me chamar.\n\nAté breve! 💚`
  };
}
function msgAprovacaoDiretoria(c){
  const dc = MSG_CONFIG.diretores[c.diretoriaId] || {nome:"", telefone:""};
  const nomeDiretor = (dc.nome||"").trim() || "[NOME DO(A) DIRETOR(A) RESPONSÁVEL — preencha na configuração acima]";
  const telDiretor = (dc.telefone||"").trim() || "[TELEFONE DO(A) DIRETOR(A) — preencha na configuração acima]";
  return {
    assunto: `Você foi ${porGenero(c.nome,"aprovado","aprovada")} para a Diretoria ${c.diretoriaNome}!`,
    corpo: `Oii, ${primeiroNome(c.nome)}! Tudo bem? 😊\n\n`+
      `Passando para te dar uma ótima notícia: você foi ${porGenero(c.nome,"aprovado","aprovada")} para integrar a Diretoria ${c.diretoriaNome} da LAPSIA! 🎉💙\n\n`+
      `Ficamos muito felizes em ter você conosco e em poder fazer parte de mais esse passo na sua formação. Esperamos que essa seja uma experiência de muito aprendizado, crescimento e troca ao longo da sua trajetória na Liga!\n\n`+
      `Como próximo passo, vou te encaminhar o contato do(a) Diretor(a) responsável pela sua Diretoria, que irá te orientar sobre suas funções, responsabilidades e as próximas atividades:\n\n`+
      `Diretor(a): ${nomeDiretor}\n`+
      `Telefone: ${telDiretor}\n\n`+
      `Também vou te adicionar ao grupo da sua Diretoria, para que você possa se integrar à equipe e acompanhar as comunicações e atividades.\n\n`+
      `A partir de agora, as principais orientações serão repassadas pelo(a) Diretor(a) da sua Diretoria. Mas, caso surja qualquer dúvida ou você precise de ajuda nesse processo de integração, fico à disposição para te auxiliar!\n\n`+
      `Seja muito ${porGenero(c.nome,"bem-vindo","bem-vinda")} à LAPSIA! 💙\nEstamos muito felizes em ter você com a gente!\n\nAbraços!`
  };
}
function msgReprovacaoDiretoria(c){
  return {
    assunto: `Retorno sobre o processo seletivo — Diretoria ${c.diretoriaNome}`,
    corpo: `Oii, ${primeiroNome(c.nome)}! Tudo bem?\n\n`+
      `Primeiramente, gostaríamos de agradecer muito pelo seu interesse em fazer parte da LAPSIA e pela sua participação em nosso processo seletivo.\n\n`+
      `Após avaliarmos cuidadosamente as entrevistas e os critérios definidos para este processo, infelizmente, desta vez você não foi ${porGenero(c.nome,"selecionado","selecionada")} para compor a Diretoria ${c.diretoriaNome} da LAPSIA.\n\n`+
      `Sabemos que participar de um processo seletivo exige tempo, dedicação e disponibilidade, por isso agradecemos genuinamente por ter compartilhado um pouco da sua trajetória e do seu interesse pela Liga conosco. Reforçamos que este resultado se refere especificamente a este processo seletivo. Esperamos poder contar com a sua participação em outras atividades e oportunidades da LAPSIA no futuro.\n\n`+
      `Agradecemos novamente pelo interesse e desejamos muito sucesso na sua trajetória acadêmica! 💙\n\nAbraços!`
  };
}
function mensagemParaEtapaDiretor(c, etapa){
  if(etapa === "aguardando_agendamento") return msgAgendamentoDiretoria(c);
  if(etapa === "aprovado_diretoria") return msgAprovacaoDiretoria(c);
  if(etapa === "reprovado_diretoria") return msgReprovacaoDiretoria(c);
  return null;
}
function etapaTituloMensagemDiretor(etapa){
  const map = {
    aguardando_agendamento:"Mensagem de agendamento da entrevista",
    aprovado_diretoria:"Devolutiva — aprovado(a)",
    reprovado_diretoria:"Devolutiva — não aprovado(a)"
  };
  return map[etapa] || "Mensagem";
}
// Card de configuração equivalente ao de Ligantes (link de agendamento, assinatura), mais o(a)
// diretor(a) responsável e telefone da diretoria específica deste candidato.
function configCardHtmlDiretoria(c){
  const dc = MSG_CONFIG.diretores[c.diretoriaId] || {nome:"", telefone:""};
  return `
    <div class="agenda-config-card">
      <div class="acc-title">Configuração das mensagens (vale para todos os candidatos nesta sessão)</div>
      <div class="acc-row">
        <label>Link de agendamento (Google Calendar)</label>
        <input type="text" value="${escapeHtml(MSG_CONFIG.linkAgendamento)}" placeholder="https://calendar.app.google/..." onchange="setMsgConfig('linkAgendamento', this.value)">
      </div>
      <div class="acc-row">
        <label>Assinatura das mensagens (seu nome)</label>
        <input type="text" value="${escapeHtml(MSG_CONFIG.remetente)}" onchange="setMsgConfig('remetente', this.value)">
      </div>
      <div class="acc-row">
        <label>Diretor(a) responsável por ${c.diretoriaNome}</label>
        <input type="text" value="${escapeHtml(dc.nome||'')}" placeholder="Nome de quem vai orientar a pessoa aprovada" onchange="setMsgConfig('diretorNome:${c.diretoriaId}', this.value)">
      </div>
      <div class="acc-row">
        <label>Telefone do(a) diretor(a) responsável</label>
        <input type="text" value="${escapeHtml(dc.telefone||'')}" placeholder="(34) 9####-####" onchange="setMsgConfig('diretorTelefone:${c.diretoriaId}', this.value)">
      </div>
    </div>`;
}
// Monta a seção "Etapa do processo" do painel de Diretores — mesma estrutura do de Ligantes
// (trilha visual + controles da etapa + cartão de mensagem pronta), só sem o bloco de rubrica.
function etapaSectionHtmlDiretor(c, etapa){
  const trilha = pipelineStepsHtmlDiretoria(etapa);
  // Os dois campos (data/hora da entrevista e resultado) ficam sempre visíveis e editáveis
  // juntos — ela pode marcar aprovado/reprovado a qualquer momento, sem depender de já ter
  // preenchido a data da entrevista antes.
  const controlesEtapa = `
    <div class="obs-field" style="margin-top:2px;">
      <label>Data/hora da entrevista (depois que ele(a) confirmar pelo link de agendamento)</label>
      ${entrevistaCellHtml(c.entrevista, `agendarEntrevistaDiretoria('${c.diretoriaId}','${c.email}', this.value).then(()=>openEvalModalDiretor('${c.diretoriaId}','${c.email}'))`)}
    </div>
    <div class="obs-field" style="margin-top:10px;">
      <label>Resultado após a entrevista</label>
      ${resultadoEntrevistaCellHtml(c.resultadoEntrevista, `salvarResultadoEntrevistaDiretoria('${c.diretoriaId}','${c.email}', this.value).then(()=>openEvalModalDiretor('${c.diretoriaId}','${c.email}'))`)}
    </div>`;
  const msg = mensagemParaEtapaDiretor(c, etapa);
  if(!msg) return trilha + controlesEtapa;
  const variant = etapa.startsWith("reprovado") ? "msg-negative" : (etapa.startsWith("aprovado") ? "msg-positive" : "");
  const notifKey = (etapa === "aguardando_agendamento") ? "agendamento" : "devolutiva";
  const textareaId = "msg-body-dir-" + notifKey;
  const dc = MSG_CONFIG.diretores[c.diretoriaId] || {nome:"", telefone:""};
  const faltaConfig = etapa === "aguardando_agendamento" ? !MSG_CONFIG.linkAgendamento.trim()
    : (etapa === "aprovado_diretoria" ? (!(dc.nome||"").trim() || !(dc.telefone||"").trim()) : false);
  return `
    ${trilha}
    ${controlesEtapa}
    <div class="msg-card ${variant}">
      <div class="msg-card-head">
        <span class="msg-card-title">${etapaTituloMensagemDiretor(etapa)}</span>
        <div class="msg-card-actions">
          <button type="button" class="btn btn-sm" onclick="copiarMensagem('${textareaId}', this)">Copiar</button>
          <button type="button" class="btn btn-sm" onclick="abrirEmailMensagem('${c.email}','${textareaId}')">✉ E-mail</button>
          <button type="button" class="btn btn-sm" onclick="abrirWhatsappMensagem('${textareaId}','${escapeHtml(c.telefone||'')}')">WhatsApp</button>
        </div>
      </div>
      <textarea id="${textareaId}" class="msg-card-body" style="width:100%;min-height:190px;resize:vertical;" readonly data-assunto="${escapeHtml(msg.assunto)}">${msg.corpo}</textarea>
      <div class="msg-card-note">${faltaConfig ? '⚠️ Preencha o link de agendamento e/ou o(a) diretor(a) responsável na configuração acima antes de enviar.' : (c.telefone ? 'O botão de WhatsApp já abre direto na conversa com ' + c.nome + '.' : 'Esse candidato não tem telefone cadastrado — o botão de WhatsApp abre sem número pré-preenchido, você escolhe o contato na hora.')}</div>
      <div class="msg-sent-row">
        <input type="checkbox" id="notif-dir-${notifKey}" ${c.notificado && c.notificado[notifKey]?"checked":""} onchange="toggleMensagemEnviada('${c.email}','${notifKey}', this.checked)">
        <label for="notif-dir-${notifKey}">Já enviei essa mensagem</label>
      </div>
    </div>`;
}
// Painel "Abrir" de Seleção de Diretores — equivalente ao openEvalModal() de Ligantes, reaproveita
// o mesmo modal (#eval-modal) e as mesmas ações de mensagem (copiar/e-mail/WhatsApp).
async function openEvalModalDiretor(diretoriaId, email){
  const d = await fetchDiretoria(diretoriaId);
  if(!d) return;
  const c = d.candidatosInscritos.find(x => x.email === email);
  if(!c) return;
  EVAL_STATE_DIRETOR = {diretoriaId, email};
  const selo = computeSelo(c.diretoriaId, c.motivacao) || (c.seloManual ? {label:c.seloManual, cls:"badge-green", icon:ICON.thumbsUp} : {label:"—", cls:"badge-gray", icon:""});

  document.getElementById("eval-modal-title").textContent = "Processo seletivo — " + c.nome;

  const body = document.getElementById("eval-modal-body");
  body.innerHTML = `
    <div class="modal-chip-row">
      <span class="badge badge-teal">${c.diretoriaNome}</span>
      <span class="badge ${selo.cls}">${selo.icon||""} ${selo.label}</span>
      <span>Turno: ${c.turno} · Período: ${c.periodo} · ${c.email}${c.telefone ? ' · ' + c.telefone : ''}</span>
    </div>
    <div class="motivation-box">
      <div class="label">Motivação do candidato</div>
      <p>${c.motivacao||''}</p>
    </div>
    ${configCardHtmlDiretoria(c)}
    ${etapaSectionHtmlDiretor(c, etapaProcessoDiretor(c))}
    <div class="modal-footer-actions">
      <button type="button" class="btn" onclick="closeEvalModal()">Fechar</button>
    </div>
    <div class="modal-footer-note">A mensagem abaixo é só texto pronto para copiar/enviar — nada é enviado automaticamente.</div>
  `;
  document.getElementById("eval-modal").classList.add("open");
}

/* ---------- FREQUÊNCIA (resumo % + submodelo "Presença" = chamada detalhada) ---------- */
async function renderFrequenciaPage(){
  return `
    <div class="page-header"><div class="title-row"><h1>Frequência</h1>${demoBadge()}</div>
      <div class="subtitle">Frequência consolidada por ligante, com chamada detalhada por encontro</div></div>
    <div class="tab-toggle" style="margin-bottom:18px;">
      <button type="button" class="${FREQ_TAB==='frequencia'?'active':''}" onclick="setFreqTab('frequencia')">Frequência</button>
      <button type="button" class="${FREQ_TAB==='presenca'?'active':''}" onclick="setFreqTab('presenca')">Presença</button>
    </div>
    <div id="freq-content">${FREQ_TAB==='frequencia' ? await renderFrequenciaResumoTab() : await renderPresencaChamadaTab()}</div>`;
}
function setFreqTab(tab){ FREQ_TAB = tab; renderMain(); }

async function renderFrequenciaResumoTab(){
  const certs = await fetchCertificados();
  const media = certs.length ? Math.round(certs.reduce((s,c)=>s+c.frequencia,0)/certs.length) : 0;
  const emDia = certs.filter(c=>c.frequencia>=c.minimo).length;
  const abaixo = certs.length - emDia;
  const statsHtml = `
    <div class="stat-card-simple"><div class="ssc-label">Presença média geral</div><div class="ssc-value">${media}%</div></div>
    <div class="stat-card-simple"><div class="ssc-label">Ligantes em dia</div><div class="ssc-value">${emDia}</div></div>
    <div class="stat-card-simple"><div class="ssc-label">Abaixo do mínimo</div><div class="ssc-value">${abaixo}</div></div>`;
  const opcoes = ["Todos", ...new Set(certs.map(c=>c.nucleo))];
  return `
    <div class="stat-grid-simple">${statsHtml}</div>
    <div class="filter-bar">
      <div class="filter-search">${ICON.search}<input type="text" placeholder="Buscar ligante..." value="${PRES_BUSCA}" oninput="setPresFiltro('busca', this.value)"></div>
      <select onchange="setPresFiltro('nucleo', this.value)">
        ${opcoes.map(o=>`<option value="${o}" ${PRES_NUCLEO===o?'selected':''}>${o==='Todos'?'Todas as opções':o}</option>`).join("")}
      </select>
      <select onchange="setPresFiltro('turno', this.value)">
        <option value="Todos" ${PRES_TURNO==='Todos'?'selected':''}>Todos os turnos</option>
        <option value="Matutino" ${PRES_TURNO==='Matutino'?'selected':''}>Matutino</option>
        <option value="Noturno" ${PRES_TURNO==='Noturno'?'selected':''}>Noturno</option>
      </select>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll"><table>
        <thead><tr><th>Ligante</th><th>Núcleo</th><th>Turno</th><th>Frequência</th><th>Mínimo</th><th>Status</th></tr></thead>
        <tbody id="pres-tbody">${renderPresRows(certs)}</tbody>
      </table></div>
    </div>`;
}
function renderPresRows(certs){
  const filtered = certs.filter(c=>{
    if(PRES_NUCLEO!=='Todos' && c.nucleo!==PRES_NUCLEO) return false;
    if(PRES_TURNO!=='Todos' && c.turno!==PRES_TURNO) return false;
    if(PRES_BUSCA && !c.ligante.toLowerCase().includes(PRES_BUSCA.toLowerCase())) return false;
    return true;
  });
  if(!filtered.length) return `<tr><td colspan="6" class="empty-state">Nenhum ligante encontrado.</td></tr>`;
  return filtered.map(c => {
    const ok = c.frequencia >= c.minimo;
    const barColor = ok ? "var(--green-500)" : "var(--red-500)";
    return `<tr>
      <td><b style="color:var(--text-900)">${c.ligante}</b></td>
      <td><span class="badge badge-teal">${c.nucleo}</span></td>
      <td>${c.turno||'—'}</td>
      <td style="min-width:160px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="bar-track" style="flex:1;"><div class="bar-fill" style="width:${c.frequencia}%;background:${barColor};"></div></div>
          <span style="font-size:12.5px;color:var(--text-500);width:34px;">${c.frequencia}%</span>
        </div>
      </td>
      <td>${c.minimo}%</td>
      <td><span class="badge ${ok?'badge-green':'badge-red'}">${ok?'em dia':'abaixo do mínimo'}</span></td>
    </tr>`;
  }).join("");
}
function setPresFiltro(tipo, valor){
  if(tipo==='busca') PRES_BUSCA=valor; else if(tipo==='nucleo') PRES_NUCLEO=valor; else if(tipo==='turno') PRES_TURNO=valor;
  fetchCertificados().then(cs=>{ const t=document.getElementById('pres-tbody'); if(t) t.innerHTML = renderPresRows(cs); });
}

// Submódulo "Presença" — chamada detalhada por encontro, como uma chamada de sala de aula.
async function renderPresencaChamadaTab(){
  const chamada = await fetchChamada();
  const datas = ["Todas", ...new Set(chamada.map(c=>c.data))].sort();
  return `
    <div class="filter-bar">
      <select onchange="setChamadaFiltro('opcao', this.value)">
        <option value="Todas" ${CHAMADA_OPCAO==='Todas'?'selected':''}>Todas as opções</option>
        ${Object.keys(OPCOES_CONFIG).map(o=>`<option value="${o}" ${CHAMADA_OPCAO===o?'selected':''}>${o}</option>`).join("")}
      </select>
      <select onchange="setChamadaFiltro('data', this.value)">
        ${datas.map(d=>`<option value="${d}" ${CHAMADA_DATA===d?'selected':''}>${d==='Todas'?'Todas as datas':formatDataBR(d)}</option>`).join("")}
      </select>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll"><table>
        <thead><tr><th>Nome</th><th>Turno</th><th>Núcleo/Liga</th><th>Data do encontro</th><th>Presente</th></tr></thead>
        <tbody id="chamada-tbody">${renderChamadaRows(chamada)}</tbody>
      </table></div>
    </div>`;
}
function formatDataBR(iso){
  const dt = new Date(iso+"T00:00:00");
  return dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function renderChamadaRows(chamada){
  const filtered = chamada.map((item, idx) => ({item, idx})).filter(({item}) => {
    if(CHAMADA_OPCAO!=='Todas' && item.opcao!==CHAMADA_OPCAO) return false;
    if(CHAMADA_DATA!=='Todas' && item.data!==CHAMADA_DATA) return false;
    return true;
  });
  if(!filtered.length) return `<tr><td colspan="5" class="empty-state">Nenhum registro de chamada para este filtro.</td></tr>`;
  return filtered.map(({item, idx}) => `
    <tr>
      <td><b style="color:var(--text-900)">${item.ligante}</b></td>
      <td>${item.turno}</td>
      <td><span class="badge badge-teal">${item.opcao}</span></td>
      <td>${formatDataBR(item.data)}</td>
      <td>
        <label class="chamada-check ${item.presente?'presente':'ausente'}">
          <input type="checkbox" ${item.presente?'checked':''} onchange="handleChamadaToggle(${idx}, this.checked)">
          <span>${item.presente?'Presente':'Ausente'}</span>
        </label>
      </td>
    </tr>`).join("");
}
function setChamadaFiltro(tipo, valor){
  if(tipo==='opcao') CHAMADA_OPCAO = valor; else CHAMADA_DATA = valor;
  fetchChamada().then(ch => { const t=document.getElementById('chamada-tbody'); if(t) t.innerHTML = renderChamadaRows(ch); });
}
async function handleChamadaToggle(index, checked){
  await salvarPresencaChamada(index, checked);
  const ch = await fetchChamada();
  const t = document.getElementById('chamada-tbody');
  if(t) t.innerHTML = renderChamadaRows(ch);
}

/* ---------- CERTIFICADOS ----------
   Revisão 14 (23/08/2026), a pedido dela: só entra nesta aba quem já bateu a frequência
   mínima (75%, igual pra núcleo e Liga Ampliada desde esta revisão) — quem ainda não bateu
   continua sendo acompanhado normalmente em Frequência, só não aparece ainda aqui. A partir
   daí ela tem, por pessoa, um botão "Gerar certificado" (individual) e, respeitando os filtros
   já aplicados na tela, um botão "Exportar em massa". Os dois já calculam exatamente quem seria
   incluído e qual carga horária cada um levaria no certificado — só a geração do arquivo .pptx
   em si (baseada no modelo que ela vai enviar) ainda está pendente; até lá, os botões mostram
   um aviso explicando o que vão fazer assim que o modelo chegar. */
function certChave(c){ return c.email || c.ligante; }
async function renderCertificadosPage(){
  const certs = await fetchCertificadosElegiveis();
  const emitidos = certs.filter(c=>c.status==='emitido').length;
  const aguardando = certs.filter(c=>c.status==='aguardando').length;
  const statsHtml = `
    <div class="stat-card-simple"><div class="ssc-label">Certificados emitidos</div><div class="ssc-value">${emitidos}</div></div>
    <div class="stat-card-simple"><div class="ssc-label">Aguardando emissão</div><div class="ssc-value">${aguardando}</div></div>`;
  const opcoes = ["Todos", ...new Set(certs.map(c=>c.nucleo))];
  return `
    <div class="page-header"><div class="title-row"><h1>Certificados</h1>${demoBadge()}</div>
      <div class="subtitle">Quem já bateu os 75% de frequência mínima entra aqui automaticamente, com nome, carga horária e frequência já prontos para o certificado</div></div>
    <div class="stat-grid-simple">${statsHtml}</div>
    <div class="filter-bar">
      <div class="filter-search">${ICON.search}<input type="text" placeholder="Buscar ligante..." value="${CERT_BUSCA}" oninput="setCertFiltro('busca', this.value)"></div>
      <select onchange="setCertFiltro('nucleo', this.value)">
        ${opcoes.map(o=>`<option value="${o}" ${CERT_NUCLEO===o?'selected':''}>${o==='Todos'?'Todas as opções':o}</option>`).join("")}
      </select>
      <select onchange="setCertFiltro('status', this.value)">
        <option value="Todos" ${CERT_STATUS==='Todos'?'selected':''}>Todos os status</option>
        <option value="emitido" ${CERT_STATUS==='emitido'?'selected':''}>Emitido</option>
        <option value="aguardando" ${CERT_STATUS==='aguardando'?'selected':''}>Aguardando emissão</option>
      </select>
      <button type="button" class="btn btn-primary" style="margin-left:auto;" onclick="handleExportarCertificadosEmMassa()">${ICON.download.replace('stroke-width="2"','stroke-width="2" stroke="#fff"')}<span>Exportar em massa</span></button>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-scroll">
        <table>
          <thead><tr><th>Ligante</th><th>Opção</th><th>Frequência</th><th>Carga horária</th><th>Status</th><th></th></tr></thead>
          <tbody id="cert-tbody">${renderCertRows(certs)}</tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer-note" style="margin-top:10px;">Clique no nome de alguém para abrir a mensagem de "certificado disponível" (e-mail/WhatsApp). O botão "Gerar certificado" já baixa o arquivo .pptx editável, preenchido com nome e carga horária (o modelo que você mandou não tem campo de CPF — avise se quiser incluir um).</div>`;
}
function certificadosFiltrados(certs){
  return certs.filter(c=>{
    if(CERT_NUCLEO!=='Todos' && c.nucleo!==CERT_NUCLEO) return false;
    if(CERT_STATUS!=='Todos' && c.status!==CERT_STATUS) return false;
    if(CERT_BUSCA && !c.ligante.toLowerCase().includes(CERT_BUSCA.toLowerCase())) return false;
    return true;
  });
}
function renderCertRows(certs){
  const filtered = certificadosFiltrados(certs);
  if(!filtered.length) return `<tr><td colspan="6" class="empty-state">Nenhum ligante encontrado.</td></tr>`;
  return filtered.map((c,i)=>certificadoRowHtml(c,i)).join("");
}
function setCertFiltro(tipo, valor){
  if(tipo==='busca') CERT_BUSCA=valor; else if(tipo==='nucleo') CERT_NUCLEO=valor; else if(tipo==='status') CERT_STATUS=valor;
  fetchCertificadosElegiveis().then(cs=>{ const t=document.getElementById('cert-tbody'); if(t) t.innerHTML = renderCertRows(cs); });
}
function certificadoRowHtml(c,i){
  let statusHtml, actionHtml = "";
  if(c.status === "emitido"){
    statusHtml = `<span class="badge badge-green">Emitido · ${c.data}</span>`;
    actionHtml = `<button class="btn btn-sm" onclick="handleGerarCertificado('${certChave(c)}')">Gerar de novo</button>`;
  } else {
    statusHtml = `<span class="badge badge-yellow">Aguardando emissão</span>`;
    actionHtml = `<button class="btn btn-primary" onclick="handleGerarCertificado('${certChave(c)}')">${ICON.download.replace('stroke-width="2"','stroke-width="2" stroke="#fff"')}<span>Gerar certificado</span></button>`;
  }
  return `<tr>
    <td><button type="button" class="link-btn" onclick="openCertificadoMsgModal('${certChave(c)}')" title="Abrir mensagem de certificado disponível">${c.ligante}</button></td>
    <td><span class="badge badge-teal">${c.nucleo}</span></td>
    <td>${c.frequencia}%</td>
    <td>${c.cargaHoraria != null ? c.cargaHoraria+'h' : '—'}</td>
    <td>${statusHtml}</td>
    <td>${actionHtml}</td>
  </tr>`;
}
/* ---------- Geração do certificado em .pptx (Revisão 15) ----------
   Recriado em código a partir do modelo real que ela enviou (PDF feito no Canva) — não é o
   arquivo original reaproveitado, é uma nova apresentação PowerPoint editável (via PptxGenJS,
   embutida no próprio HTML) com o mesmo layout: brasão/moldura nos 4 cantos, logo da Unitri,
   título "CERTIFICADO", nome em destaque, texto de conclusão com a carga horária, período e
   selo com o semestre, e as duas assinaturas (presidente + coordenadora do curso).
   É uma reconstrução visual, não uma cópia pixel-a-pixel — as fontes de título/assinatura
   (serifada) e do nome (cursiva) usam nomes de fonte comuns do Office (Georgia/Segoe Script);
   se a fonte exata não estiver instalada na máquina de quem abrir, o PowerPoint substitui por
   uma parecida automaticamente. Como o arquivo gerado é um .pptx de verdade, todo elemento
   (texto, cores, posição) continua editável normalmente depois de aberto — inclusive pra ela
   adicionar um campo de CPF, caso decida que quer um; o modelo que ela mandou não tem esse
   campo, então o certificado gerado também não tem.
   Layout pensado para uma slide A4 paisagem (11.69 x 8.27"), do mesmo tamanho do PDF original. */
const CERT_SLIDE_W = 11.69, CERT_SLIDE_H = 8.27;
function adicionarMolduraCantos(slide){
  const nc = CERTIFICADO_TEMPLATE.corNavy, gd = CERTIFICADO_TEMPLATE.corDourado;
  const cantos = [
    {hx:0.35, hy:0.35, vx:0.35, vy:0.35}, // topo-esquerda
    {hx:CERT_SLIDE_W-0.35-1.7, hy:0.35, vx:CERT_SLIDE_W-0.35-0.06, vy:0.35}, // topo-direita
    {hx:0.35, hy:CERT_SLIDE_H-0.35-0.06, vx:0.35, vy:CERT_SLIDE_H-0.35-1.7}, // baixo-esquerda
    {hx:CERT_SLIDE_W-0.35-1.7, hy:CERT_SLIDE_H-0.35-0.06, vx:CERT_SLIDE_W-0.35-0.06, vy:CERT_SLIDE_H-0.35-1.7} // baixo-direita
  ];
  cantos.forEach(p => {
    slide.addShape("rect", {x:p.hx, y:p.hy, w:1.7, h:0.06, fill:{color:nc}, line:{type:"none"}});
    slide.addShape("rect", {x:p.vx, y:p.vy, w:0.06, h:1.7, fill:{color:nc}, line:{type:"none"}});
  });
  const cantosGold = [
    {hx:0.55, hy:0.55, vx:0.55, vy:0.55},
    {hx:CERT_SLIDE_W-0.55-1.35, hy:0.55, vx:CERT_SLIDE_W-0.55-0.045, vy:0.55},
    {hx:0.55, hy:CERT_SLIDE_H-0.55-0.045, vx:0.55, vy:CERT_SLIDE_H-0.55-1.35},
    {hx:CERT_SLIDE_W-0.55-1.35, hy:CERT_SLIDE_H-0.55-0.045, vx:CERT_SLIDE_W-0.55-0.045, vy:CERT_SLIDE_H-0.55-1.35}
  ];
  cantosGold.forEach(p => {
    slide.addShape("rect", {x:p.hx, y:p.hy, w:1.35, h:0.045, fill:{color:gd}, line:{type:"none"}});
    slide.addShape("rect", {x:p.vx, y:p.vy, w:0.045, h:1.35, fill:{color:gd}, line:{type:"none"}});
  });
}
// Uma pessoa = uma slide, no layout do modelo dela. `dataEmissao` é a data em que o certificado
// está sendo gerado (usada na linha "Uberlândia, [dia] de [mês] de [ano]").
function adicionarSlideCertificado(pptx, c, dataEmissao){
  const t = CERTIFICADO_TEMPLATE;
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  adicionarMolduraCantos(slide);

  slide.addImage({ data: t.logoBase64, x: CERT_SLIDE_W/2 - 1.2, y: 0.55, w: 2.4, h: 2.4/(215/53) });

  slide.addText("CERTIFICADO", {
    x:0, y:1.55, w:CERT_SLIDE_W, h:0.85, align:"center", fontFace:"Georgia", bold:true,
    fontSize:46, color:t.corNavy, charSpacing:6
  });
  slide.addShape("rect", {x:CERT_SLIDE_W/2-1.1, y:2.42, w:0.85, h:0.018, fill:{color:t.corDourado}, line:{type:"none"}});
  slide.addShape("rect", {x:CERT_SLIDE_W/2+0.25, y:2.42, w:0.85, h:0.018, fill:{color:t.corDourado}, line:{type:"none"}});
  slide.addText("✦", {x:CERT_SLIDE_W/2-0.25, y:2.28, w:0.5, h:0.3, align:"center", fontSize:15, color:t.corDourado});

  slide.addText("A Liga Acadêmica LAPSIA da UNITRI certifica que", {
    x:0, y:2.62, w:CERT_SLIDE_W, h:0.35, align:"center", italic:true, fontFace:"Calibri", fontSize:14.5, color:t.corNavyClara
  });

  slide.addText(c.ligante, {
    x:0.8, y:2.98, w:CERT_SLIDE_W-1.6, h:0.95, align:"center", fontFace:"Segoe Script",
    fontSize:38, color:t.corNavy, fit:"shrink", shrinkText:true
  });
  slide.addShape("rect", {x:CERT_SLIDE_W/2-2.6, y:3.86, w:5.2, h:0.015, fill:{color:t.corNavyClara}, line:{type:"none"}});

  const horas = c.cargaHoraria != null ? c.cargaHoraria : "[X]";
  slide.addText(
    `concluiu com êxito as atividades referentes ao segundo semestre da Liga Acadêmica, cumprindo a carga `+
    `horária de ${horas} horas, demonstrando dedicação, compromisso acadêmico e participação ativa nas `+
    `atividades desenvolvidas.`,
    { x:1.15, y:4.08, w:CERT_SLIDE_W-2.3, h:1.15, align:"center", fontFace:"Calibri", fontSize:14.5, color:t.corTextoCorpo, lineSpacingMultiple:1.25 }
  );

  slide.addText(
    `Período: ${t.periodoInicio} a ${t.periodoFim} · Uberlândia, ${formatarDataExtensoPtBr(dataEmissao)}`,
    { x:0, y:5.4, w:CERT_SLIDE_W, h:0.35, align:"center", italic:true, fontFace:"Calibri", fontSize:12, color:t.corNavyClara }
  );

  // Assinaturas — presidente (esquerda) e coordenadora do curso (direita), fixas por semestre.
  // Caixa mais larga + fonte com autoajuste (fit:"shrink") + valign:"top" evitam que um nome
  // longo (ex.: "Ludmila Sulzbeck Guimarães Santos Rodrigues") quebre em 2 linhas e "suba"
  // por cima do traço da assinatura — problema visto no primeiro teste desta função.
  // Bloco deslocado um pouco mais para cima (underline em y:6.90) para não cair na faixa
  // horizontal dourada da moldura de canto (y:7.675–7.72) — a largura maior por si só
  // resolvia a quebra de linha, mas empurrar o texto pra baixo criava esse 2º cruzamento.
  const assinaturaW = 3.6;
  [{x:0.65, p:t.presidente}, {x:CERT_SLIDE_W-0.65-assinaturaW, p:t.coordenadora}].forEach(({x,p}) => {
    slide.addShape("rect", {x, y:6.90, w:assinaturaW, h:0.012, fill:{color:"333333"}, line:{type:"none"}});
    slide.addText(p.nome, {
      x, y:7.00, w:assinaturaW, h:0.3, align:"center", valign:"top", bold:true,
      fontFace:"Calibri", fontSize:11, color:t.corNavy, fit:"shrink", shrinkText:true
    });
    slide.addText(p.cargo, {x, y:7.34, w:assinaturaW, h:0.26, align:"center", italic:true, fontFace:"Calibri", fontSize:9.5, color:t.corNavyClara});
  });

  // Selo central com o semestre — alinhado verticalmente com o novo centro do bloco de assinaturas.
  slide.addShape("ellipse", {
    x:CERT_SLIDE_W/2-0.72, y:6.62, w:1.44, h:1.44, fill:{color:"FFFFFF"}, line:{color:t.corDourado, width:1.5}
  });
  slide.addText(espacado("LAPSIA"), {x:CERT_SLIDE_W/2-0.72, y:6.92, w:1.44, h:0.28, align:"center", bold:true, fontFace:"Calibri", fontSize:9, color:t.corNavy, charSpacing:1});
  slide.addText(espacado(t.semestre), {x:CERT_SLIDE_W/2-0.72, y:7.22, w:1.44, h:0.28, align:"center", fontFace:"Calibri", fontSize:9, color:t.corNavy, charSpacing:1});
}
function novaApresentacaoCertificado(){
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name:"CERT", width:CERT_SLIDE_W, height:CERT_SLIDE_H });
  pptx.layout = "CERT";
  pptx.author = "LAPSIA · UNITRI";
  pptx.title = "Certificado LAPSIA";
  return pptx;
}
function nomeArquivoCertificado(nome){
  return "Certificado_" + nome.trim().replace(/\s+/g,"_").replace(/[^\w-]/g,"") + "_LAPSIA.pptx";
}
async function handleGerarCertificado(chave){
  const certs = await fetchCertificados();
  const c = certs.find(x => certChave(x) === chave);
  if(!c) return;
  const pptx = novaApresentacaoCertificado();
  const agora = new Date();
  adicionarSlideCertificado(pptx, c, agora);
  await pptx.writeFile({ fileName: nomeArquivoCertificado(c.ligante) });
  c.status = "emitido";
  c.data = new Intl.DateTimeFormat('pt-BR').format(agora);
  showToast(`Certificado de ${c.ligante} baixado (.pptx editável) — falta só revisar e, se quiser, incluir o CPF antes de enviar.`);
  const tCert = document.getElementById("cert-tbody");
  if(tCert) fetchCertificadosElegiveis().then(cs => { tCert.innerHTML = renderCertRows(cs); });
}
async function handleExportarCertificadosEmMassa(){
  const certs = await fetchCertificadosElegiveis();
  const filtrados = certificadosFiltrados(certs);
  if(!filtrados.length){
    showToast("Nenhum certificado elegível com o filtro atual.");
    return;
  }
  const pptx = novaApresentacaoCertificado();
  const agora = new Date();
  filtrados.forEach(c => adicionarSlideCertificado(pptx, c, agora));
  const nomeArquivo = "Certificados_LAPSIA_" + new Intl.DateTimeFormat('pt-BR').format(agora).replace(/\//g,"-") + ".pptx";
  await pptx.writeFile({ fileName: nomeArquivo });
  filtrados.forEach(c => { c.status = "emitido"; c.data = new Intl.DateTimeFormat('pt-BR').format(agora); });
  showToast(`${filtrados.length} certificado(s) exportado(s) num único arquivo .pptx (uma página por pessoa): ${filtrados.map(c=>c.ligante).join(", ")}.`);
  const tCert = document.getElementById("cert-tbody");
  if(tCert) fetchCertificadosElegiveis().then(cs => { tCert.innerHTML = renderCertRows(cs); });
}

// Mensagem de "certificado disponível" — pedido dela (23/08/2026): poder clicar no nome da
// pessoa em Certificados e abrir e-mail/WhatsApp já com o texto pronto, pra ela anexar o
// certificado que baixou. Reaproveita o mesmo modal (#eval-modal) e os mesmos botões de
// Copiar/E-mail/WhatsApp já usados no fluxo de Ligantes/Diretores.
function msgCertificadoPronto(c){
  const destino = c.nucleo === LAPSIA_DB.ligaAmpliada.nome ? "na Liga Ampliada" : `no Núcleo de ${c.nucleo}`;
  return {
    assunto: "Seu certificado da LAPSIA já está disponível",
    corpo: `Olá, ${primeiroNome(c.ligante)}! Tudo bem?\n\n`+
      `A Diretoria Administrativa e de Pessoas da LAPSIA informa que o seu certificado de participação ${destino} já está disponível!\n\n`+
      `Segue em anexo o arquivo do seu certificado.\n\n`+
      `Qualquer dúvida, pode procurar a Diretoria Administrativa: ${MSG_CONFIG.responsaveisCertificado || "[nomes — preencha na configuração acima]"}.\n\n`+
      `Abraços,\n${MSG_CONFIG.remetente}`
  };
}
async function openCertificadoMsgModal(chave){
  EVAL_STATE_CERT = chave;
  const certs = await fetchCertificados();
  const c = certs.find(x => certChave(x) === chave);
  if(!c) return;
  document.getElementById("eval-modal-title").textContent = "Certificado — " + c.ligante;
  const body = document.getElementById("eval-modal-body");
  const msg = msgCertificadoPronto(c);
  const textareaId = "msg-body-certificado";
  body.innerHTML = `
    <div class="modal-chip-row">
      <span class="badge badge-teal">${c.nucleo}</span><span>${c.turno||'—'}</span>${c.email?`<span>${c.email}</span>`:""}
    </div>
    <div class="agenda-config-card">
      <div class="acc-title">Configuração da mensagem (vale para todos os certificados nesta sessão)</div>
      <div class="acc-row">
        <label>Diretoria Administrativa (quem responde dúvidas)</label>
        <input type="text" value="${escapeHtml(MSG_CONFIG.responsaveisCertificado)}" onchange="setMsgConfig('responsaveisCertificado', this.value)">
      </div>
    </div>
    <div class="msg-card msg-positive">
      <div class="msg-card-head">
        <span class="msg-card-title">Certificado disponível</span>
        <div class="msg-card-actions">
          <button type="button" class="btn btn-sm" onclick="copiarMensagem('${textareaId}', this)">Copiar</button>
          <button type="button" class="btn btn-sm" onclick="abrirEmailMensagem('${escapeHtml(c.email||'')}','${textareaId}')">✉ E-mail</button>
          <button type="button" class="btn btn-sm" onclick="abrirWhatsappMensagem('${textareaId}','${escapeHtml(c.telefone||'')}')">WhatsApp</button>
        </div>
      </div>
      <textarea id="${textareaId}" class="msg-card-body" style="width:100%;min-height:170px;resize:vertical;" readonly data-assunto="${escapeHtml(msg.assunto)}">${msg.corpo}</textarea>
      <div class="msg-card-note">⚠️ E-mail e WhatsApp abrem só com o texto pronto — não é possível anexar arquivo automaticamente por esses links. Anexe manualmente o certificado que você baixou antes de enviar.</div>
      <div class="msg-sent-row">
        <input type="checkbox" id="cert-notif" ${c.avisoCertificadoEnviado?"checked":""} onchange="toggleAvisoCertificadoEnviado('${chave}', this.checked)">
        <label for="cert-notif">Já avisei essa pessoa</label>
      </div>
    </div>
    <div class="modal-footer-actions">
      <button type="button" class="btn" onclick="closeEvalModal()">Fechar</button>
    </div>
    <div class="modal-footer-note">Esta mensagem é só texto pronto para copiar/enviar — nada é enviado automaticamente.</div>
  `;
  document.getElementById("eval-modal").classList.add("open");
}
async function toggleAvisoCertificadoEnviado(chave, checked){
  const certs = await fetchCertificados();
  const c = certs.find(x => certChave(x) === chave);
  if(c) c.avisoCertificadoEnviado = checked;
}

/* ---------- FEEDBACK (formulário anônimo) ---------- */
async function renderFeedbackPage(){
  const respostas = await fetchFeedback();
  const filtered = respostas.filter(r => FEEDBACK_OPCAO==='Todas' || r.opcao===FEEDBACK_OPCAO);
  const avg = (campo) => filtered.length ? (filtered.reduce((s,r)=>s+r[campo],0)/filtered.length) : 0;
  const fmt = (n) => filtered.length ? n.toFixed(1) : "—";
  const statsHtml = `
    <div class="stat-card-simple"><div class="ssc-label">Nota média dos encontros</div><div class="ssc-value">${fmt(avg('notaEncontros'))}/5</div></div>
    <div class="stat-card-simple"><div class="ssc-label">Os encontros foram bem organizados</div><div class="ssc-value">${fmt(avg('concOrganizados'))}/5</div></div>
    <div class="stat-card-simple"><div class="ssc-label">O conteúdo foi relevante</div><div class="ssc-value">${fmt(avg('concConteudo'))}/5</div></div>
    <div class="stat-card-simple"><div class="ssc-label">O ritmo foi adequado</div><div class="ssc-value">${fmt(avg('concRitmo'))}/5</div></div>`;
  const abertasHtml = !filtered.length ? `<div class="empty-state" style="padding:20px 0;">Nenhuma resposta para esta opção ainda.</div>` : `
    <div class="oq-title">Em uma palavra ou frase, como você descreveria os encontros?</div>
    <div class="oq-list">${filtered.map(r=>`<div class="oq-item">"${r.palavraChave}"</div>`).join("")}</div>
    <div class="oq-title">O que você mudaria?</div>
    <div class="oq-list">${filtered.map(r=>`<div class="oq-item">${r.oQueMudar}</div>`).join("")}</div>
    <div class="oq-title">Comentário livre</div>
    <div class="oq-list">${filtered.map(r=>`<div class="oq-item">${r.comentario}</div>`).join("")}</div>`;
  return `
    <div class="page-header"><div class="title-row"><h1>Feedback</h1>${demoBadge()}</div>
      <div class="subtitle">Pesquisa semestral anônima, respondida por formulário</div></div>
    <div class="privacy-notice"><b>Aviso de privacidade:</b> As respostas de feedback são anônimas. Nunca são associadas à identidade do respondente. Esta regra é inviolável.</div>
    <div class="filter-bar" style="justify-content:space-between;">
      <select onchange="setFeedbackFiltro(this.value)">
        <option value="Todas" ${FEEDBACK_OPCAO==='Todas'?'selected':''}>Todos</option>
        ${Object.keys(OPCOES_CONFIG).map(o=>`<option value="${o}" ${FEEDBACK_OPCAO===o?'selected':''}>${o}</option>`).join("")}
      </select>
      <span class="feedback-count" id="feedback-count">${filtered.length} resposta${filtered.length!==1?'s':''}</span>
    </div>
    <div class="stat-grid-simple" style="grid-template-columns:repeat(4,1fr);">${statsHtml}</div>
    <div class="card open-responses-card">
      <h3>${ICON.inbox} Respostas abertas (anônimas)</h3>
      ${abertasHtml}
    </div>
    <div class="card">
      <h3>${ICON.users} Feedback da coordenação</h3>
      <p style="font-size:13.5px;color:var(--text-700);line-height:1.6;margin:0;">Além da pesquisa anônima acima, cada ligante também passa por uma conversa individual de 15 minutos com o coordenador(a) do núcleo, baseada no relatório de engajamento do período — esse retorno não é anônimo e não substitui a pesquisa.</p>
    </div>`;
}
function setFeedbackFiltro(valor){
  FEEDBACK_OPCAO = valor;
  renderMain();
}

/* ---------- AGENDAMENTO DE SALA ----------
   Módulo ainda não especificado com ela (ver spec de migração — sempre foi só um placeholder
   no sistema real). A pedido dela, criamos a tela com os filtros padrão já usados nos outros
   submódulos da diretoria, mas sem inventar mais nenhuma informação/funcionalidade além disso
   até validar o formato (quais salas existem, como funciona o conflito de horário, etc.). */
function renderAgendamentoSalaPage(){
  return `
    <div class="page-header"><div class="title-row"><h1>Agendamento de Sala</h1>${demoBadge()}</div>
      <div class="subtitle">Reserva de salas para encontros da LAPSIA — módulo em definição</div></div>
    <div class="filter-bar">
      <div class="filter-search">${ICON.search}<input type="text" placeholder="Buscar..." value="${SALA_BUSCA}" oninput="setSalaFiltro('busca', this.value)"></div>
      <select onchange="setSalaFiltro('opcao', this.value)">
        <option value="Todas" ${SALA_OPCAO==='Todas'?'selected':''}>Todas as opções</option>
        ${Object.keys(OPCOES_CONFIG).map(o=>`<option value="${o}" ${SALA_OPCAO===o?'selected':''}>${o}</option>`).join("")}
      </select>
      <select onchange="setSalaFiltro('turno', this.value)">
        <option value="Todos" ${SALA_TURNO==='Todos'?'selected':''}>Todos os turnos</option>
        <option value="Matutino" ${SALA_TURNO==='Matutino'?'selected':''}>Matutino</option>
        <option value="Noturno" ${SALA_TURNO==='Noturno'?'selected':''}>Noturno</option>
      </select>
      <select onchange="setSalaFiltro('semestre', this.value)">
        <option value="2025.2" ${SALA_SEMESTRE==='2025.2'?'selected':''}>2025.2</option>
        <option value="2026.1" ${SALA_SEMESTRE==='2026.1'?'selected':''}>2026.1</option>
        <option value="2026.2" ${SALA_SEMESTRE==='2026.2'?'selected':''}>2026.2</option>
      </select>
    </div>
    <div class="placeholder-page">
      ${ICON.building}
      <h3>Módulo ainda a definir</h3>
      <p>Os filtros acima já seguem o mesmo padrão dos outros submódulos, prontos para uso. O restante (lista de salas, conflito de horário, confirmação de reserva) ainda não foi validado com a diretoria — nada aqui deve ser considerado especificação até essa conversa acontecer.</p>
    </div>`;
}
function setSalaFiltro(tipo, valor){
  if(tipo==='busca') SALA_BUSCA = valor;
  else if(tipo==='opcao') SALA_OPCAO = valor;
  else if(tipo==='turno') SALA_TURNO = valor;
  else if(tipo==='semestre') SALA_SEMESTRE = valor;
  renderMain();
}

function renderConfigPage(){
  return `
    <div class="page-header"><div class="title-row"><h1>Configurações</h1></div>
      <div class="subtitle">Preferências do sistema</div></div>
    <div class="placeholder-page">
      ${ICON.settings}
      <h3>Nada para configurar ainda</h3>
      <p>Espaço reservado para preferências do sistema (usuários, permissões, integrações) conforme forem definidas.</p>
    </div>`;
}

/* ================================== MODAL DE AVALIAÇÃO ================================== */
async function openEvalModal(email){
  const candidatos = await fetchCuradoria();
  const c = candidatos.find(x => x.email === email);
  if(!c) return;
  EVAL_STATE = email;
  const opcaoTipo = c.opcao === "Liga Ampliada" ? "liga" : "nucleo";
  const cfg = OPCOES_CONFIG[c.opcao] || {vagas:"—", corte:"—"};
  const notasPreenchidas = RUBRICA_CRITERIOS.every(k => c.notas[k] !== null && c.notas[k] !== undefined);
  const total = notasPreenchidas ? RUBRICA_CRITERIOS.reduce((s,k)=>s+c.notas[k],0) : null;

  document.getElementById("eval-modal-title").textContent = "Avaliação — " + c.nome;

  const body = document.getElementById("eval-modal-body");
  body.innerHTML = `
    <div class="modal-chip-row">
      <span class="badge badge-teal">${c.opcao}</span>
      <span>Turno: ${c.turno} · Período: ${c.periodo} · ${c.email}${c.telefone ? ' · ' + c.telefone : ''}</span>
    </div>
    <div class="motivation-box">
      <div class="label">Motivação do candidato</div>
      <p>${c.motivacaoTexto}</p>
    </div>
    <div id="eval-criteria">
      ${RUBRICA_CRITERIOS.map(k => criterionHtml(k, c.notas[k], opcaoTipo)).join("")}
    </div>
    <div class="nota-total-box">
      <div>
        <div class="ntb-label">Nota Total</div>
        <div class="ntb-sub">Corte mínimo: ${cfg.corte}/20 · ${cfg.vagas} vagas (a nota é calculada de acordo com a quantidade de vagas da opção)</div>
      </div>
      <div class="ntb-value">${total===null?'—':total}/20</div>
    </div>
    <div class="checkbox-row">
      <input type="checkbox" id="eval-etica" ${c.etica==="Sim"?"checked":""} onchange="handleEticaChange(this.checked)">
      <div>
        <label for="eval-etica" class="cr-title" style="cursor:pointer;">Evidência de discriminação / postura antiética</label>
        <div class="cr-sub">Marcar elimina o candidato independentemente das notas.</div>
      </div>
    </div>
    <div class="obs-field">
      <label>Observações (opcional)</label>
      <input type="text" id="eval-obs" value="${c.observacoes||''}" placeholder="Anotações da entrevista, combinados, etc.">
    </div>
    ${configCardHtml(c)}
    ${etapaSectionHtml(c, etapaProcessoLigante(c))}
    <div class="modal-footer-actions">
      <button type="button" class="btn" onclick="closeEvalModal()">Cancelar</button>
      <button type="button" class="btn btn-primary" onclick="handleSalvarAvaliacao()">${ICON.save}<span>Salvar Avaliação</span></button>
    </div>
    <div class="modal-footer-note">As notas e a ética já são salvas automaticamente a cada clique; "Salvar Avaliação" grava também a observação e fecha o modal. As mensagens abaixo são só texto pronto para copiar/enviar — nada é enviado automaticamente.</div>
  `;
  document.getElementById("eval-modal").classList.add("open");
}
function closeEvalModal(){
  document.getElementById("eval-modal").classList.remove("open");
  EVAL_STATE = null;
  EVAL_STATE_DIRETOR = null;
  EVAL_STATE_CERT = null;
  // Atualiza a tabela por trás do modal, seja ela a de Seleção de Ligantes, de Diretores ou de Certificados.
  fetchCuradoria().then(cs => {
    const tSellig = document.getElementById("sellig-tbody");
    if(tSellig) tSellig.innerHTML = renderSelligRows(cs);
  });
  const tSeldir = document.getElementById("seldir-tbody");
  if(tSeldir) fetchDiretorias().then(() => { tSeldir.innerHTML = renderSeldirRows(allCandidatosDiretores()); });
  const tCert = document.getElementById("cert-tbody");
  if(tCert) fetchCertificadosElegiveis().then(cs => { tCert.innerHTML = renderCertRows(cs); });
}
async function handleSalvarAvaliacao(){
  if(!EVAL_STATE) return;
  const obsEl = document.getElementById("eval-obs");
  await salvarObservacoesCuradoria(EVAL_STATE, obsEl ? obsEl.value : "");
  closeEvalModal();
}
function levelOf(v){
  if(v===null||v===undefined) return null;
  if(v<=1) return "insuf";
  if(v<=3) return "parcial";
  return "consist";
}
function criterionHtml(criterio, valor, opcaoTipo){
  const label = RUBRICA_LABELS[criterio];
  const textos = RUBRICA_TEXTOS[criterio][opcaoTipo];
  const level = levelOf(valor);
  const levelLabelMap = {insuf:"insuficiente", parcial:"parcial", consist:"consistente"};
  return `
    <div class="criterion">
      <div class="criterion-head">
        <span class="crit-name">${label}</span>
        <div class="score-btns">
          ${[0,1,2,3,4,5].map(n => `<button type="button" class="score-btn ${valor===n?'selected':''}" onclick="handleScoreClick('${criterio}', ${n})">${n}</button>`).join("")}
        </div>
      </div>
      ${level ? `<div class="crit-level-tag ${level}">${levelLabelMap[level]} — ${textos[level]}</div>` : `<div class="crit-level-tag" style="color:var(--text-400);">ainda não avaliado</div>`}
      <div class="rubric-3col">
        <div class="rubric-cell ${level==='insuf'?'active-insuf':''}"><b>Insuficiente (0-1)</b>${textos.insuf}</div>
        <div class="rubric-cell ${level==='parcial'?'active-parcial':''}"><b>Parcial (2-3)</b>${textos.parcial}</div>
        <div class="rubric-cell ${level==='consist'?'active-consist':''}"><b>Consistente (4-5)</b>${textos.consist}</div>
      </div>
    </div>`;
}
async function handleScoreClick(criterio, valor){
  if(!EVAL_STATE) return;
  await salvarNotaCuradoria(EVAL_STATE, criterio, valor);
  openEvalModal(EVAL_STATE); // re-renderiza o modal com o novo valor
}
async function handleEticaChange(checked){
  if(!EVAL_STATE) return;
  await salvarEticaCuradoria(EVAL_STATE, checked ? "Sim" : "Não");
}

/* ================================== BOOT ================================== */
