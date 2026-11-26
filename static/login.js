//cerca utente con la mail e password inseriti nel campo.
//se non lo trova da messaggio di errore (non specifica cosa è sbagliato)
//se l'operazione avviene con successo si va a conferma

const formLogin = document.getElementById("form-login");
const messaggioErrore = document.getElementById("messaggio-errore");

formLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const utenti = JSON.parse(localStorage.getItem("utenti")) || [];

    let utenteTrovato = null;

    for (let i = 0; i < utenti.length; i++) {
        if (utenti[i].email === email && utenti[i].password === password) {
            utenteTrovato = utenti[i];
            break;
        }
    }

    if (utenteTrovato === null) {
        messaggioErrore.textContent = "Email o password non corretti.";
        messaggioErrore.hidden = false;
        return;
    }

    localStorage.setItem("utenteLoggato", JSON.stringify({
        nome: utenteTrovato.nome,
        cognome: utenteTrovato.cognome,
        email: utenteTrovato.email
    }));

    window.location.href = "/conferma";
});