const utente =
    JSON.parse(localStorage.getItem("utenteLoggato"));
//legge utente salvato

if (utente === null) {
    window.location.href = "index.html"; //torna alla home se non ha fatto accesso
}
else {
    document.getElementById("nome-utente").textContent = utente.nome;
}
