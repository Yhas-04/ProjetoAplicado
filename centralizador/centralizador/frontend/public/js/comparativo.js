import { getStatusPico } from './pico.js';

const APPS = [
    {
        id: 'vidcar',
        nome: 'VidCar',
        cor: '#2563eb',
        icone: '🚗',
        tarifaBase:    3.50,
        tarifaPorKm:   2.20,
        tarifaPorMin:  0.30,
        tempoMedioMin: 4,
        lojaAndroid:   'https://play.google.com/store/search?q=vidcar',
        lojaIos:       'https://apps.apple.com/br/search?term=vidcar',
    },
    {
        id: 'dkpop',
        nome: 'DKPop',
        cor: '#7c3aed',
        icone: '🚕',
        tarifaBase:    3.00,
        tarifaPorKm:   2.00,
        tarifaPorMin:  0.25,
        tempoMedioMin: 6,
        lojaAndroid:   'https://play.google.com/store/search?q=dkpop',
        lojaIos:       'https://apps.apple.com/br/search?term=dkpop',
    },
    {
        id: 'rota49',
        nome: 'Rota 49',
        cor: '#059669',
        icone: '🚙',
        tarifaBase:    2.80,
        tarifaPorKm:   1.90,
        tarifaPorMin:  0.22,
        tempoMedioMin: 5,
        lojaAndroid:   'https://play.google.com/store/search?q=rota49',
        lojaIos:       'https://apps.apple.com/br/search?term=rota+49',
    },
];

export function calcularComparativo(distanciaKm, duracaoMin) {
    const { emPico, multiplicador } = getStatusPico();

    return APPS.map(app => {
        const precoBase = app.tarifaBase
            + (app.tarifaPorKm  * distanciaKm)
            + (app.tarifaPorMin * duracaoMin);

        const precoFinal = emPico
            ? +(precoBase * multiplicador).toFixed(2)
            : +precoBase.toFixed(2);

        const variacao  = 1 + (Math.random() * 0.10 - 0.05);
        const precoReal = +(precoFinal * variacao).toFixed(2);

        return {
            ...app,
            precoEstimado: precoReal,
            precoBase:     +precoBase.toFixed(2),
            tempoEspera:   app.tempoMedioMin + Math.floor(Math.random() * 3),
            emPico,
            multiplicador,
        };
    }).sort((a, b) => a.precoEstimado - b.precoEstimado);
}

export function renderizarComparativo(elementoId, distanciaKm, duracaoMin) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    const resultados = calcularComparativo(distanciaKm, duracaoMin);

    el.innerHTML = `
        <div class="comparativo-header">
            <h3 class="comparativo-titulo">Comparativo de preços</h3>
            <span class="comparativo-sub">Estimativas para ${distanciaKm.toFixed(1)} km · ${duracaoMin} min</span>
        </div>
        <div class="comparativo-cards">
            ${resultados.map((app, i) => `
                <div class="app-card ${i === 0 ? 'app-card-destaque' : ''}">
                    ${i === 0 ? '<div class="app-melhor-preco">Melhor preço</div>' : ''}
                    <div class="app-card-topo">
                        <span class="app-icone">${app.icone}</span>
                        <span class="app-nome" style="color:${app.cor}">${app.nome}</span>
                    </div>
                    <div class="app-preco">
                        R$ ${app.precoEstimado.toFixed(2).replace('.', ',')}
                    </div>
                    ${app.emPico ? `
                        <div class="app-pico-aviso">
                            ⚡ Com tarifa dinâmica (${app.multiplicador.toFixed(1)}x)
                        </div>
                    ` : ''}
                    <div class="app-tempo-espera">
                        🕐 ~${app.tempoEspera} min de espera
                    </div>
                    <div class="app-acoes">
                        <a href="${app.lojaAndroid}" target="_blank" class="btn-abrir-app btn-android">
                            Android
                        </a>
                        <a href="${app.lojaIos}" target="_blank" class="btn-abrir-app btn-ios">
                            iOS
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}