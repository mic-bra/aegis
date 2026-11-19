const map= L.map("map").setView([40.8518,14.2681],13);
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
// Gestione opzione "Altro" nel menu a tendina del form
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

// Elenco stazioni e segnaposto sulla mappa
const stazioni = [
    {
        nome: "Napoli Garibaldi",
        lat: 40.8529,
        lng: 14.2722,
        stato: "Guasto: ascensore binario 2 fuori servizio"
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
    }
];

stazioni.forEach(function (stazione) {
    L.marker([stazione.lat, stazione.lng])
        .addTo(map)
        .bindPopup(`<strong>${stazione.nome}</strong><br>${stazione.stato}`);
});