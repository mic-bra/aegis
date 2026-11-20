//controllo che l'email non esiste gia, se esiste lo dice,
// altrimenti aggiunge la mail e la prota a conferma html

const formRegister = document.getElementById("form-register");
const messaggioErrore = document.getElementById("messaggio-errore");

formRegister.addEventListener("submit", function (event) {
    event.preventDefault();                                          //evita che la pagina si ricarichi

    const nuovoUtente = {
        nome: document.getElementById("nome").value.trim(),
        cognome: document.getElementById("cognome").value.trim(),
        email: document.getElementById("email").value.trim().toLowerCase(),
        password: document.getElementById("password").value
    };

    const utenti = JSON.parse(localStorage.getItem("utenti")) || [];   //account già registrati (se non ce ne sono, lista vuota)

    for (let i = 0; i < utenti.length; i++) {
        if (utenti[i].email === nuovoUtente.email) {
            messaggioErrore.textContent = "Esiste già un account con questa email.";
            messaggioErrore.hidden = false;
            return;                                                  //si ferma qui
        }
    }

    utenti.push(nuovoUtente);
    localStorage.setItem("utenti", JSON.stringify(utenti));          //salva la lista aggiornata

    localStorage.setItem("utenteLoggato", JSON.stringify({           //dopo la registrazione l'utente è già dentro (senza password)
        nome: nuovoUtente.nome,
        cognome: nuovoUtente.cognome,
        email: nuovoUtente.email
    }));

    window.location.href = "conferma.html";
});
