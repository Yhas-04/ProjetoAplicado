import { buscarCoordenadas } from './nominatim.js';

const lat = -27.027074;
const lon = -51.145337;
const zoom = 20;

const map = L.map('map').setView([lat, lon], zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const marcador = L.marker([lat, lon]).addTo(map);
marcador.bindPopup('<b>Localização</b><br>Descrição do ponto.').openPopup();

let marcadorOrigem  = null;
let marcadorDestino = null;
let linhaRota       = null;

function adicionarMarcador(coords, label) {
    return L.marker([coords.lat, coords.lon])
        .addTo(map)
        .bindPopup(`<b>${label}</b><br>${coords.nome}`)
        .openPopup();
}

function tracarLinha(origem, destino) {
    if (linhaRota) map.removeLayer(linhaRota);

    linhaRota = L.polyline(
        [[origem.lat, origem.lon], [destino.lat, destino.lon]],
        { color: 'blue', weight: 4, opacity: 0.7 }
    ).addTo(map);

    map.fitBounds(linhaRota.getBounds(), { padding: [50, 50] });
}

export async function calcularRota(enderecoOrigem, enderecoDestino) {
    if (marcadorOrigem)  map.removeLayer(marcadorOrigem);
    if (marcadorDestino) map.removeLayer(marcadorDestino);

    const origem  = await buscarCoordenadas(enderecoOrigem);
    const destino = await buscarCoordenadas(enderecoDestino);

    marcadorOrigem  = adicionarMarcador(origem,  'Origem');
    marcadorDestino = adicionarMarcador(destino, 'Destino');

    tracarLinha(origem, destino);

    return { origem, destino };
}