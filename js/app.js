/* ================================== ESTADO / NAVEGAÇÃO ================================== */
let CURRENT_PAGE = {type:"dashboard"};
let OPEN_GROUPS = new Set(["administrativa-pessoas"]);
let EVAL_STATE = null; // email do candidato em avaliação no modal (Ligantes)
let EVAL_STATE_DIRETOR = null; // {diretoriaId, email} do candidato em avaliação no modal (Diretores)
let EVAL_STATE_CERT = null; // email (ou nome, se faltar e-mail) do certificado aberto no modal de aviso

// Estado dos filtros de cada submódulo (fica em memória, não precisa de servidor)
let CRONO_TAB = "linha";           // "linha" | "grade"
let CRONO_FILTRO_OPCAO = "Todas";
let CRONO_FILTRO_TURNO = "Todos";
let SELDIR_BUSCA = "", SELDIR_DIRETORIA = "Todas", SELDIR_TURNO = "Todos", SELDIR_SEMESTRE = "2026.2";
let SELLIG_BUSCA = "", SELLIG_OPCAO = "Todas", SELLIG_TURNO = "Todos", SELLIG_SEMESTRE = "2026.2";
let PRES_BUSCA = "", PRES_NUCLEO = "Todos", PRES_TURNO = "Todos";
let CERT_BUSCA = "", CERT_NUCLEO = "Todos", CERT_STATUS = "Todos";
let FREQ_TAB = "frequencia";        // "frequencia" (resumo %) | "presenca" (chamada detalhada)
let CHAMADA_OPCAO = "Todas", CHAMADA_DATA = "Todas";
let FEEDBACK_OPCAO = "Todas";
let SALA_BUSCA = "", SALA_OPCAO = "Todas", SALA_TURNO = "Todos", SALA_SEMESTRE = "2026.2";

function navigate(page){
  CURRENT_PAGE = page;
  if(page.type === "diretoria") OPEN_GROUPS.add(page.id);
  if(page.type === "submodulo") OPEN_GROUPS.add(page.diretoriaId);
  renderSidebar();
  renderMain();
  document.getElementById("main").scrollTop = 0;
}

function toggleGroup(id, ev){
  if(ev) ev.stopPropagation();
  if(OPEN_GROUPS.has(id)) OPEN_GROUPS.delete(id); else OPEN_GROUPS.add(id);
  renderSidebar();
}

/* ================================== LOGIN / LOGOUT ================================== */
async function handleLogin(){
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const senha = document.getElementById("login-senha").value;
  const errorEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");
  btn.disabled = true;
  btn.textContent = "Entrando...";
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  btn.disabled = false;
  btn.textContent = "Entrar";
  if(error){
    errorEl.textContent = "E-mail ou senha inválidos.";
    return;
  }
  errorEl.textContent = "";
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app").classList.add("active");
  navigate({type:"dashboard"});
}
async function handleLogout(){
  await sb.auth.signOut();
  document.getElementById("app").classList.remove("active");
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("login-error").textContent = "";
}
document.addEventListener("keydown", function(e){
  if(e.key === "Enter" && document.getElementById("login-screen").style.display !== "none"){
    handleLogin();
  }
});
