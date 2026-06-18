import { buscarCoordenadas, buscarSugestoes } from './nominatim.js';
import { calcularRota } from './mapaLeaflet.js';

const inputOrigem = document.getElementById('origem');
const inputDestino = document.getElementById('destino');
const btnBuscar = document.getElementById('btnBuscar');
const formRoteiro = document.getElementById('formRoteiro');
const loadingDiv = document.getElementById('loading');
const erroDiv = document.getElementById('erro');
const resultadoDiv = document.getElementById('resultado');

let localOrigem = null;
let localDestino = null;
let timeoutSugestao = null;


document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});


function setupEventListeners() {
    btnBuscar.addEventListener('click', buscarRota);
    
    inputOrigem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarRota();
        }
    });
    
    inputDestino.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarRota();
        }
    });

    inputOrigem.addEventListener('input', () => {
        clearTimeout(timeoutSugestao);
        timeoutSugestao = setTimeout(() => {
            buscarSugestoesInput('origem');
        }, 500);
    });
    
    inputDestino.addEventListener('input', () => {
        clearTimeout(timeoutSugestao);
        timeoutSugestao = setTimeout(() => {
            buscarSugestoesInput('destino');
        }, 500);
    });

    document.addEventListener('click', (e) => {
        const sugestoesOrigem = document.getElementById('sugestoesOrigem');
        const sugestoesDestino = document.getElementById('sugestoesDestino');
        
        if (!e.target.closest('.campo')) {
            if (sugestoesOrigem) sugestoesOrigem.style.display = 'none';
            if (sugestoesDestino) sugestoesDestino.style.display = 'none';
        }
    });

    formRoteiro.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarRota();
    });
}

async function buscarRota() {
    const origemText = inputOrigem.value.trim();
    const destinoText = inputDestino.value.trim();

    if (!origemText) {
        mostrarErro('Digite a origem');
        inputOrigem.focus();
        return;
    }
    
    if (!destinoText) {
        mostrarErro('Digite o destino');
        inputDestino.focus();
        return;
    }

    mostrarLoading(true);
    esconderErro();
    resultadoDiv.innerHTML = '';

    try {
        const { origem, destino } = await calcularRota(origemText, destinoText);

        localOrigem = origem;
        localDestino = destino;

        mostrarResultado(origem, destino);

    } catch (error) {
        console.error('Erro ao buscar rota:', error);
        mostrarErro(error.message);
    } finally {
        mostrarLoading(false);
    }
}

function mostrarResultado(origem, destino) {
    let distancia = '';
    if (typeof calcularDistancia === 'function') {
        const dist = calcularDistancia(
            origem.lat, origem.lon,
            destino.lat, destino.lon
        );
        distancia = `${dist} km`;
    }

    resultadoDiv.innerHTML = `
        <div class="resultado-content">
            <h3>Informações da Rota</h3>
            <div class="resultado-item">
                <span class="resultado-label">Origem:</span>
                <span class="resultado-value">${origem.nome}</span>
            </div>
            <div class="resultado-item">
                <span class="resultado-label">Destino:</span>
                <span class="resultado-value">${destino.nome}</span>
            </div>
            ${distancia ? `
            <div class="resultado-item">
                <span class="resultado-label">Distância:</span>
                <span class="resultado-value">${distancia}</span>
            </div>
            ` : ''}
            <div class="resultado-item">
                <span class="resultado-label">Coordenadas:</span>
                <span class="resultado-value">
                    Origem: ${origem.lat.toFixed(6)}, ${origem.lon.toFixed(6)}<br>
                    Destino: ${destino.lat.toFixed(6)}, ${destino.lon.toFixed(6)}
                </span>
            </div>
        </div>
    `;
}

async function buscarSugestoesInput(tipo) {
    const input = tipo === 'origem' ? inputOrigem : inputDestino;
    const sugestoesDiv = document.getElementById(`sugestoes${capitalizar(tipo)}`);
    const termo = input.value.trim();

    if (!sugestoesDiv) return;

    if (termo.length < 2) {
        sugestoesDiv.style.display = 'none';
        return;
    }

    try {
        if (typeof buscarSugestoes !== 'function') {
            return;
        }

        const sugestoes = await buscarSugestoes(termo);
        
        if (sugestoes.length === 0) {
            sugestoesDiv.style.display = 'none';
            return;
        }

        sugestoesDiv.innerHTML = sugestoes.map(s => `
            <div class="sugestao-item" 
                 data-lat="${s.lat}" 
                 data-lon="${s.lon}" 
                 data-nome="${s.nome.replace(/"/g, '&quot;')}">
                ${s.nome}
            </div>
        `).join('');

        sugestoesDiv.style.display = 'block';

        sugestoesDiv.querySelectorAll('.sugestao-item').forEach(el => {
            el.addEventListener('click', async () => {
                const lat = parseFloat(el.dataset.lat);
                const lon = parseFloat(el.dataset.lon);
                const nome = el.dataset.nome;

                input.value = nome;
                sugestoesDiv.style.display = 'none';

                if (tipo === 'origem') {
                    localOrigem = { lat, lon, nome };
                } else {
                    localDestino = { lat, lon, nome };
                }

                if (localOrigem && localDestino) {
                    await calcularRota(
                        localOrigem.nome,
                        localDestino.nome
                    );
                    mostrarResultado(localOrigem, localDestino);
                }
            });
        });

    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        sugestoesDiv.style.display = 'none';
    }
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function mostrarLoading(ativo) {
    if (loadingDiv) {
        loadingDiv.style.display = ativo ? 'block' : 'none';
    }
}

function mostrarErro(mensagem) {
    if (erroDiv) {
        erroDiv.textContent = mensagem;
        erroDiv.style.display = 'block';
        setTimeout(() => {
            if (erroDiv) {
                erroDiv.style.display = 'none';
            }
        }, 5000);
    }
}

function esconderErro() {
    if (erroDiv) {
        erroDiv.style.display = 'none';
    }
}

window.testarBusca = async function(origem, destino) {
    inputOrigem.value = origem;
    inputDestino.value = destino;
    await buscarRota();
};