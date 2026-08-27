(async function boot(){
  const { data: { session } } = await sb.auth.getSession();
  if(session){
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("active");
  }
  renderSidebar();
})();
