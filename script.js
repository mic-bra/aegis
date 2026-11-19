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