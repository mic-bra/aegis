const boxAccesso = document.getElementById("box-accesso");
const voceEsci = document.getElementById("voce-esci");
const bottoneEsci = document.getElementById("btn-esci");
const utenteLoggato = JSON.parse(localStorage.getItem("utenteLoggato"));

if (utenteLoggato !== null) {
    boxAccesso.hidden = true; //accedi e registrati hidden
    voceEsci.hidden = false; //mostra esci nel menu
}

bottoneEsci.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("utenteLoggato"); //cancella accesso
    window.location.reload(); //ricarica home
});

const map = L.map("map").setView([40.8518, 14.2681], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

const linkMappa = document.getElementById("link-mappa");
const linkSegnala = document.getElementById("link-segnala");
const sezioneMappa = document.getElementById("sezione-mappa");
const sezioneSegnala = document.getElementById("sezione-segnala");

linkMappa.addEventListener("click", function (event) {
    event.preventDefault();
    sezioneSegnala.hidden = true;
    sezioneMappa.hidden = false;
    map.invalidateSize();
});

linkSegnala.addEventListener("click", function (event) {
    event.preventDefault();
    sezioneMappa.hidden = true;
    sezioneSegnala.hidden = false;
});

const selectStazione = document.getElementById("stazione");
const inputAltro = document.getElementById("stazione-altro");

selectStazione.addEventListener("change", function () {
    if (selectStazione.value === "altro") {
        inputAltro.hidden = false;
        inputAltro.required = true;
    } else {
        inputAltro.hidden = true;
        inputAltro.required = false;
    }
});

const stazioni = [
    {
        nome: "Napoli Garibaldi",
        lat: 40.8529,
        lng: 14.2722,
        stato: "Guasto: ascensore binario 2 fuori servizio"
    },
    {
        nome: "Napoli Gianturco",
        lat: 40.8535,
        lng: 14.2878,
        stato: "Accessibile: rampe e percorsi tattili attivi"
    },
    {
        nome: "Napoli Montesanto",
        lat: 40.8473,
        lng: 14.2448,
        stato: "Attenzione: montascale in manutenzione"
    },
    {
        nome: "Toledo (Linea 1)",
        lat: 40.8427,
        lng: 14.2491,
        stato: "Accessibile: ascensori e rampe attivi"
    },
    {
        nome: "Mergellina",
        lat: 40.8288,
        lng: 14.2215,
        stato: "Accessibile: percorso senza barriere attivo"
    },
    {
        nome: "Roma Termini",
        lat: 41.9010,
        lng: 12.5018,
        stato: "Accessibile: assistenza Sala Blu e ascensori attivi"
    },
    {
        nome: "Milano Centrale",
        lat: 45.4861,
        lng: 9.2040,
        stato: "Guasto: ascensore binario 10 temporaneamente fermo"
    },
    {
        nome: "Firenze Santa Maria Novella",
        lat: 43.7764,
        lng: 11.2478,
        stato: "Accessibile: percorsi a raso e servizi attivi"
    }
];

const datalistaStazioni = document.getElementById("lista-stazioni");

stazioni.forEach(function (stazione) {
    stazione.marker = L.marker([stazione.lat, stazione.lng])
        .addTo(map)
        .bindPopup(`<strong>${stazione.nome}</strong><br>${stazione.stato}`);

    if (datalistaStazioni) {
        const opzione = document.createElement("option");
        opzione.value = stazione.nome;
        datalistaStazioni.appendChild(opzione);
    }
});

const formRicerca = document.querySelector("#sezione-mappa form");
const inputRicerca = document.getElementById("cerca-stazione");   //prendere un elemento tramite id

formRicerca.addEventListener("submit", function (event) {
    event.preventDefault();
    const testoCercato = inputRicerca.value.trim().toLowerCase();
    if (testoCercato === "") return;

    let trovata = false;

    for (let i = 0; i < stazioni.length; i++) {
        let nomeStazione = stazioni[i].nome.toLowerCase();

        if (nomeStazione.includes(testoCercato)) {
            map.setView([stazioni[i].lat, stazioni[i].lng], 16);
            stazioni[i].marker.openPopup();
            trovata = true;
            break;
        }
    }

    if (!trovata) {
        alert("Nessuna stazione trovata. Prova con Garibaldi, Toledo o Mergellina.");
    }
});