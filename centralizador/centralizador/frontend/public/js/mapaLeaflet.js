const map = L.map('map').setView([-27.1, -51.15], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const marcador = L.marker([-27.1, -51.15]).addTo(map);
marcador.bindPopup('<b>Localização</b><br>Descrição do ponto.').openPopup();