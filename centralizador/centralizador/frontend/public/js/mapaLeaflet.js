import { buscarCoordenadas } from './nominatim.js';


const LAT_INICIAL = -27.027074;
const LON_INICIAL = -51.145337;

const map = L.map('map').setView([LAT_INICIAL, LON_INICIAL], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let marcadorOrigem  = null;
let marcadorDestino = null;
let linhaRota       = null;


const iconeOrigem = L.divIcon({
    className: '',
    html: `<div style="
        width:14px;height:14px;
        background:#38d9a9;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(0,0,0,0.35)">
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const iconeDestino = L.divIcon({
    className: '',
    html: `<div style="
        width:14px;height:14px;
        background:#4f6ef7;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(0,0,0,0.35)">
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

function adicionarMarcador(coords, label, icone) {
    return L.marker([coords.lat, coords.lon], { icon: icone })
        .addTo(map)
        .bindPopup(`<strong>${label}</strong><br><small>${coords.nome.split(',').slice(0, 2).join(',')}</small>`);
}

function tracarLinha(origem, destino) {
    if (linhaRota) map.removeLayer(linhaRota);
    linhaRota = L.polyline(
        [[origem.lat, origem.lon], [destino.lat, destino.lon]],
        { color: '#4f6ef7', weight: 3, opacity: 0.8, dashArray: '8 6' }
    ).addTo(map);
    map.fitBounds(linhaRota.getBounds(), { padding: [50, 50] });
}


function haversine(lat1, lon1, lat2, lon2) {
    const R  = 6371;
    const dL = (lat2 - lat1) * Math.PI / 180;
    const dO = (lon2 - lon1) * Math.PI / 180;
    const a  = Math.sin(dL/2)**2 +
               Math.cos(lat1 * Math.PI / 180) *
               Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dO/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function calcularRota(enderecoOrigem, enderecoDestino) {
    if (marcadorOrigem)  map.removeLayer(marcadorOrigem);
    if (marcadorDestino) map.removeLayer(marcadorDestino);

    const origem  = await buscarCoordenadas(enderecoOrigem);
    const destino = await buscarCoordenadas(enderecoDestino);

    marcadorOrigem  = adicionarMarcador(origem,  'Origem',  iconeOrigem);
    marcadorDestino = adicionarMarcador(destino, 'Destino', iconeDestino);

    tracarLinha(origem, destino);

    const distanciaKm = haversine(origem.lat, origem.lon, destino.lat, destino.lon);

    return { origem, destino, distanciaKm };
}