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

const linkNotizie = document.getElementById("link-notizie");
const sezioneNotizie = document.getElementById("sezione-notizie");

linkMappa.addEventListener("click", function (event) {
    event.preventDefault();
    sezioneSegnala.hidden = true;
    sezioneNotizie.hidden = true;
    sezioneMappa.hidden = false;
    map.invalidateSize();
});

linkSegnala.addEventListener("click", function (event) {
    event.preventDefault();
    sezioneMappa.hidden = true;
    sezioneNotizie.hidden = true;
    sezioneSegnala.hidden = false;
});

linkNotizie.addEventListener("click", function (event) {
    event.preventDefault();
    sezioneMappa.hidden = true;
    sezioneSegnala.hidden = true;
    sezioneNotizie.hidden = false;
    aggiornaBacheca();   //aggiorna la bacheca
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

const stazioni = [];   //si riempie con i dati di OpenStreetMap

const datalistaStazioni = document.getElementById("lista-stazioni");

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
        alert("Nessuna stazione trovata. Prova a scrivere solo una parte del nome.");
    }
});
const formSegnala = document.getElementById("form-segnala");
const textareaDescrizione = document.getElementById("descrizione");
const avvisoAccesso = document.getElementById("avviso-accesso");
const bottoneInvia = document.getElementById("btn-invia");
const bacheca = document.getElementById("bacheca");
const statoBacheca = document.getElementById("stato-bacheca");
let ultimoContenuto = null;   //ricorda cosa c'era l'ultima volta, per ridisegnare solo se cambia

if (utenteLoggato === null) {
    avvisoAccesso.hidden = false;    //spiega perché non si può inviare segnalaziome
    bottoneInvia.disabled = true;    //blocca il pulsante
}

formSegnala.addEventListener("submit", function (event) {
    event.preventDefault();
    if (utenteLoggato === null) return;

    let nomeStazione;
    if (selectStazione.value === "altro") {
        nomeStazione = inputAltro.value.trim();
    } else {
        nomeStazione = selectStazione.options[selectStazione.selectedIndex].text;
    }
    const descrizione = textareaDescrizione.value.trim();
    if (nomeStazione === "" || descrizione === "") return;

        let autore = utenteLoggato.nome;
        if (utenteLoggato.cognome) {
            autore = autore + " " + utenteLoggato.cognome.charAt(0) + ".";
        }

        const nuovaSegnalazione = {
            utente : autore,
            stazione: nomeStazione,
            descrizione: descrizione,
            data: Date.now() //data e ora in millisecondi
        };

    const segnalazioni = JSON.parse(localStorage.getItem("segnalazioni")) || [];
    segnalazioni.unshift(nuovaSegnalazione); //unshift = la mette per prima
    localStorage.setItem("segnalazioni", JSON.stringify(segnalazioni));

    formSegnala.reset();//svuota il form
    inputAltro.hidden = true;
    inputAltro.required = false;

    aggiornaBacheca();
    aggiornaMarker();   //aggiorna i segnaposti sulla mappa
    if (trovaStazione(nomeStazione) === null) {
        alert("Segnalazione inviata. Questa stazione non è ancora sulla mappa: la trovi nelle Notizie ma non ha un segnaposto.");
    }
    sezioneSegnala.hidden = true; //mostra la bacheca con la nuova segnalazione
    sezioneNotizie.hidden = false;
});

function aggiornaBacheca() {
    const salvato = localStorage.getItem("segnalazioni") || "[]";
    if (salvato === ultimoContenuto) return;//nulla di nuovo: non fa niente
    ultimoContenuto = salvato;

    const segnalazioni = JSON.parse(salvato);
    bacheca.innerHTML = "";   //svuota la bacheca

    if (segnalazioni.length === 0) {
        const vuoto = document.createElement("p");
        vuoto.textContent = "Nessuna segnalazione per ora.";
        bacheca.appendChild(vuoto);
        statoBacheca.textContent = "0 segnalazioni";
        return;
    }

    segnalazioni.forEach(function (segnalazione) {
        const riquadro = document.createElement("article");
        riquadro.className = "segnalazione";

        const info = document.createElement("p");
        info.className = "segnalazione-info";
        const autore = document.createElement("strong");
        autore.textContent = segnalazione.utente;
        const data = new Date(segnalazione.data).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
        info.appendChild(autore);
        info.appendChild(document.createTextNode(" · " + segnalazione.stazione + " · " + data));

        const testo = document.createElement("p");
        testo.textContent = segnalazione.descrizione;   //textContent e non innerHTML: il testo scritto dall'utente non può inserire codice

        riquadro.appendChild(info);
        riquadro.appendChild(testo);
        bacheca.appendChild(riquadro);
    });

    if (segnalazioni.length === 1) {
        statoBacheca.textContent = "1 segnalazione";
    } else {
        statoBacheca.textContent = segnalazioni.length + " segnalazioni";
    }
}

aggiornaBacheca();
setInterval(function () {
    aggiornaBacheca();
    aggiornaMarker();
}, 3000);

const SOGLIA_ARANCIONE = 3;   //+ 3 segnalazioni il segnaposto diventa arancione
const SOGLIA_ROSSO = 6;       //+ 6 segnalazioni diventa rosso (sotto 3 è giallo)
let ultimoContenutoMarker = null;

//collega il nome scritto nella segnalazione a una stazione dell'array "stazioni" (null se non la trova)
function trovaStazione(testo) {
    const cercato = testo.trim().toLowerCase();
    if (cercato === "") return null;

    for (let i = 0; i < stazioni.length; i++) { //1) nome identico
        if (stazioni[i].nome.toLowerCase() === cercato) return stazioni[i];
    }

    const simili = stazioni.filter(function (stazione) { //2) un solo nome lo contiene ("garibaldi")
        return stazione.nome.toLowerCase().includes(cercato);
    });
    if (simili.length === 1) return simili[0];

    return null; //nessuna stazione, oppure troppo generico (es. "napoli")
}

function creaIcona(numero) {
    let colore = "giallo";
    if (numero >= SOGLIA_ROSSO) {
        colore = "rosso";
    } else if (numero >= SOGLIA_ARANCIONE) {
        colore = "arancione";
    }
    return L.divIcon({  //icona disegnata un cerchio colorato col numero dentro
        className: "segnaposto segnaposto-" + colore,
        html: String(numero),
        iconSize: [34, 34],
        popupAnchor: [0, -18]
    });
}

function aggiornaMarker() {
    const salvato = localStorage.getItem("segnalazioni") || "[]";
    if (salvato === ultimoContenutoMarker) return;  //non disegna niente se non ci sono novita
    ultimoContenutoMarker = salvato;

    const segnalazioni = JSON.parse(salvato);

    stazioni.forEach(function (stazione) {
        stazione.numeroSegnalazioni = 0;  //riparte da zero per ogni stazione
    });

    segnalazioni.forEach(function (segnalazione) {
        const stazione = trovaStazione(segnalazione.stazione);
        if (stazione !== null) {
            stazione.numeroSegnalazioni++;  //+1
        }
    });

    stazioni.forEach(function (stazione) {
        if (stazione.marker) {
            map.removeLayer(stazione.marker);  //toglie il segnaposto vecchio (se c'è)
        }
        const numero = stazione.numeroSegnalazioni;
        let testoPopup = `<strong>${escapi(stazione.nome)}</strong><br>${stazione.stato}<br>${stazione.fonte}`;

        if (numero === 0) {  //nessuna segnalazione: segnaposto normale
            stazione.marker = L.marker([stazione.lat, stazione.lng])
                .addTo(map)
                .bindPopup(testoPopup);
        } else {  //almeno una: segnaposto colorato col numero
            let scritta = numero + " segnalazioni";
            if (numero === 1) scritta = "1 segnalazione";
            testoPopup += `<br><strong>${scritta}</strong> degli utenti`;

            stazione.marker = L.marker([stazione.lat, stazione.lng], {
                icon: creaIcona(numero),
                title: stazione.nome + ": " + scritta,
                alt: stazione.nome + ": " + scritta
            })
                .addTo(map)
                .bindPopup(testoPopup);
        }
    });
}

aggiornaMarker();//li disegna appena si apre la pagina

//stazioni api
const URL_OVERPASS = "https://overpass-api.de/api/interpreter";
const AREA = "40.78,14.10,40.95,14.40"; //zona di Napoli: sud, ovest, nord, est
const DURATA_CACHE = 24 * 60 * 60 * 1000;//i dati scaricati restano validi 24 ore (in millisecondi)
const ANNI_VALIDITA = 3;//un dato più vecchio di 3 anni diventa "sconosciuto"
const statoStazioni = document.getElementById("stato-stazioni");

//i nomi arrivano da internet: tolgo i simboli che potrebbero diventare codice HTML nel popup
function escapi(testo) {
    return testo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

//1) scarica le stazioni (o le prende dalla copia salvata nel browser)
async function scaricaElementi() {
    const salvato = JSON.parse(localStorage.getItem("cacheStazioni"));   //{ elementi, ora } oppure null

    if (salvato !== null && Date.now() - salvato.ora < DURATA_CACHE) {
        return { elementi: salvato.elementi, ora: salvato.ora, vecchi: false };   //copia recente: nessuna richiesta a internet
    }

    //tutte le stazioni ferroviarie dell'area, con data di modifica e centro
    const query = '[out:json][timeout:25][bbox:' + AREA + '];nwr["railway"="station"];out meta center;';

    try {
        const risposta = await fetch(URL_OVERPASS + "?data=" + encodeURIComponent(query));
        if (!risposta.ok) throw new Error("Errore HTTP " + risposta.status);
        const dati = await risposta.json();

        localStorage.setItem("cacheStazioni", JSON.stringify({ elementi: dati.elements, ora: Date.now() }));
        return { elementi: dati.elements, ora: Date.now(), vecchi: false };
    } catch (errore) {
        if (salvato !== null) {
            return { elementi: salvato.elementi, ora: salvato.ora, vecchi: true };   //internet non va: uso la copia vecchia
        }
        throw errore; //non c'è nemmeno quella da errore
    }
}

//2) legge il tag "wheelchair" di OpenStreetMap. Se manca o è troppo vecchio : "sconosciuta", mai "accessibile"
function leggiAccessibilita(tag, timestamp) {
    const data = new Date(timestamp);
    let fonte = "Fonte: OpenStreetMap, data di aggiornamento non disponibile";
    let datoVecchio = true;

    if (!isNaN(data.getTime())) {
        fonte = "Fonte: OpenStreetMap, aggiornato il " + data.toLocaleDateString("it-IT");
        datoVecchio = (Date.now() - data.getTime()) > ANNI_VALIDITA * 365 * 24 * 60 * 60 * 1000;
    }

    if (tag.wheelchair === undefined) {
        return { livello: "sconosciuta", stato: "Accessibilità sconosciuta (dato assente)", fonte: fonte };
    }
    if (datoVecchio) {
        return { livello: "sconosciuta", stato: "Accessibilità sconosciuta (dato non aggiornato)", fonte: fonte };
    }
    if (tag.wheelchair === "yes" || tag.wheelchair === "designated") {
        return { livello: "si", stato: "Accessibile per sedia a rotelle", fonte: fonte };
    }
    if (tag.wheelchair === "limited") {
        return { livello: "limitata", stato: "Parzialmente accessibile per sedia a rotelle", fonte: fonte };
    }
    if (tag.wheelchair === "no") {
        return { livello: "no", stato: "Non accessibile per sedia a rotelle", fonte: fonte };
    }
    return { livello: "sconosciuta", stato: "Accessibilità sconosciuta (valore non riconosciuto)", fonte: fonte };
}

//3) trasforma un elemento di OpenStreetMap in una stazione, con gli stessi campi di prima
function creaStazioneDaOsm(elemento) {
    if (!elemento.tags || !elemento.tags.name) return null; //senza nome non si usa

    let lat = elemento.lat; //i punti hanno lat e lon
    let lng = elemento.lon;
    if (lat === undefined && elemento.center) { //le aree hanno il centro
        lat = elemento.center.lat;
        lng = elemento.center.lon;
    }
    if (lat === undefined || lng === undefined) return null;

    const accessibilita = leggiAccessibilita(elemento.tags, elemento.timestamp);
    return {
        nome: elemento.tags.name,
        lat: lat,
        lng: lng,
        accessibilita: accessibilita.livello,
        stato: accessibilita.stato,
        fonte: accessibilita.fonte
    };
}

//4) riempie il menu a tendina del form "Segnala" con le stazioni caricate
function riempiMenuStazioni() {
    const opzioneAltro = selectStazione.querySelector("option[value='altro']");
    stazioni.forEach(function (stazione) {
        const opzione = document.createElement("option");
        opzione.value = stazione.nome;
        opzione.textContent = stazione.nome;
        selectStazione.insertBefore(opzione, opzioneAltro); // mette stazionu prima di "Altro"
    });
}

//5) mostra le stazioni: suggerimenti della ricerca, menu del form e segnaposti
function mostraStazioni() {
    stazioni.sort(function (a, b) {
        return a.nome.localeCompare(b.nome, "it");//ordine alfabetico
    });

    stazioni.forEach(function (stazione) {
        const opzione = document.createElement("option");
        opzione.value = stazione.nome;
        datalistaStazioni.appendChild(opzione);
    });

    riempiMenuStazioni();
    ultimoContenutoMarker = null; //forza aggiorna Marker a ridisegnare
    aggiornaMarker();
}

//6) funzione che mette insieme tutto
async function caricaStazioni() {
    statoStazioni.textContent = "Caricamento delle stazioni da OpenStreetMap, non riavviare la pagina...";

    try {
        const risultato = await scaricaElementi();

        risultato.elementi.forEach(function (elemento) {
            const nuova = creaStazioneDaOsm(elemento);
            if (nuova === null) return;

            const giaPresente = stazioni.find(function (stazione) {    //stessa stazione scritta due volte
                return stazione.nome.toLowerCase() === nuova.nome.toLowerCase();
            });

            if (giaPresente === undefined) {
                stazioni.push(nuova);
            } else if (giaPresente.accessibilita === "sconosciuta" && nuova.accessibilita !== "sconosciuta") {
                Object.assign(giaPresente, nuova);// mantengo quella con più informazioni
            }
        });

        if (stazioni.length === 0) {
            statoStazioni.textContent = "Nessuna stazione trovata in questa zona.";
            return;
        }

        mostraStazioni();

        const conDato = stazioni.filter(function (stazione) {
            return stazione.accessibilita !== "sconosciuta";
        }).length;
        let messaggio = stazioni.length + " stazioni caricate da OpenStreetMap, " + conDato + " con accessibilità nota.";
        if (risultato.vecchi) {
            messaggio += " Internet non disponibile: copia salvata il " + new Date(risultato.ora).toLocaleDateString("it-IT") + ".";
        }
        statoStazioni.textContent = messaggio;
    } catch (errore) {
        statoStazioni.textContent = "Impossibile caricare le stazioni. Riprova più tardi.";
    }
}

caricaStazioni();//parte quando si apre la pagina

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrato con successo');
    } catch (errore) {
      console.error('Errore nella registrazione del Service Worker:', errore);
    }
  });
}