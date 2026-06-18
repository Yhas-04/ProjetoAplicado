import { buscarCoordenadas, buscarSugestoes } from './nominatim.js';
import { calcularRota }                        from './mapaLeaflet.js';
import { salvarHistorico }                     from './storage.js';
import { renderizarBannerPico }                from './pico.js';
import { renderizarComparativo }               from './comparativo.js';
import { renderizarHistorico, renderizarFavoritos } from './ui.js';

const inputOrigem  = document.getElementById('origem');
const inputDestino = document.getElementById('destino');
const btnBuscar    = document.getElementById('btnBuscar');
const formRoteiro  = document.getElementById('formRoteiro');
const loadingDiv   = document.getElementById('loading');
const erroDiv      = document.getElementById('erro');
const resultadoDiv = document.getElementById('resultado-conteudo');

let localOrigem  = null;
let localDestino = null;
let timeoutSugestao = null;
let contadorBuscas  = 0;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupAbas();
    renderizarBannerPico('bannerPico');
    renderizarPainelLateral();

    setInterval(() => renderizarBannerPico('bannerPico'), 60_000);
});

function setupEventListeners() {
    btnBuscar.addEventListener('click', buscarRota);

    inputOrigem.addEventListener('keydown',  e => { if (e.key === 'Enter') { e.preventDefault(); buscarRota(); } });
    inputDestino.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarRota(); } });

    inputOrigem.addEventListener('input', () => {
        clearTimeout(timeoutSugestao);
        timeoutSugestao = setTimeout(() => buscarSugestoesInput('origem'), 500);
    });
    inputDestino.addEventListener('input', () => {
        clearTimeout(timeoutSugestao);
        timeoutSugestao = setTimeout(() => buscarSugestoesInput('destino'), 500);
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.campo')) {
            document.getElementById('sugestoesOrigem')?.style.setProperty('display','none');
            document.getElementById('sugestoesDestino')?.style.setProperty('display','none');
        }
    });

    formRoteiro.addEventListener('submit', e => { e.preventDefault(); buscarRota(); });
}

function setupAbas() {
    document.querySelectorAll('.aba').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aba').forEach(b => b.classList.remove('aba-ativa'));
            btn.classList.add('aba-ativa');
            renderizarAba(btn.dataset.aba);
        });
    });
}

function renderizarAba(aba) {
    if (!resultadoDiv) return;
    if (aba === 'historico') {
        renderizarHistorico('resultado-conteudo', reutilizarRota);
        return;
    }
    if (aba === 'favoritos') {
        renderizarFavoritos('resultado-conteudo', usarFavorito);
        return;
    }
    if (!localOrigem || !localDestino) {
        resultadoDiv.innerHTML = '<p class="lista-vazia">Busque uma rota primeiro.</p>';
        return;
    }
    if (aba === 'resumo')      renderizarResumo();
    if (aba === 'comparativo') _renderizarComparativoAtual();
}

async function buscarRota() {
    const origemText  = inputOrigem.value.trim();
    const destinoText = inputDestino.value.trim();

    if (!origemText)  { mostrarErro('Digite a origem');  inputOrigem.focus();  return; }
    if (!destinoText) { mostrarErro('Digite o destino'); inputDestino.focus(); return; }

    mostrarLoading(true);
    esconderErro();

    try {
        const { origem, destino, distanciaKm, duracaoMin } = await calcularRota(origemText, destinoText);

        localOrigem  = origem;
        localDestino = destino;

        window._localOrigemAtual  = origem;
        window._localDestinoAtual = destino;

        salvarHistorico(origem, destino, distanciaKm);

        contadorBuscas++;
        const contadorEl = document.getElementById('contadorTexto');
        if (contadorEl) contadorEl.textContent = `${contadorBuscas} rota(s) comparada(s)`;

        _atualizarStatsBar(distanciaKm, duracaoMin);

        const abaAtiva = document.querySelector('.aba-ativa')?.dataset.aba || 'resumo';
        if (abaAtiva === 'resumo')      renderizarResumo(distanciaKm, duracaoMin);
        if (abaAtiva === 'comparativo') _renderizarComparativoAtual(distanciaKm, duracaoMin);

        renderizarBannerPico('bannerPico');

    } catch (error) {
        console.error('Erro ao buscar rota:', error);
        mostrarErro(error.message);
    } finally {
        mostrarLoading(false);
    }
}

function renderizarResumo(distanciaKm, duracaoMin) {
    if (!resultadoDiv) return;

    resultadoDiv.innerHTML = `
        <div class="resultado-content">
            <h3>Informações da Rota</h3>
            <div class="resultado-item">
                <span class="resultado-label">Origem:</span>
                <span class="resultado-value">${localOrigem.nome}</span>
            </div>
            <div class="resultado-item">
                <span class="resultado-label">Destino:</span>
                <span class="resultado-value">${localDestino.nome}</span>
            </div>
            ${distanciaKm ? `
            <div class="resultado-item">
                <span class="resultado-label">Distância:</span>
                <span class="resultado-value">${distanciaKm} km</span>
            </div>` : ''}
            ${duracaoMin ? `
            <div class="resultado-item">
                <span class="resultado-label">Duração:</span>
                <span class="resultado-value">~${duracaoMin} min</span>
            </div>` : ''}
            <div class="resultado-item">
                <span class="resultado-label">Coordenadas:</span>
                <span class="resultado-value">
                    Origem: ${localOrigem.lat.toFixed(6)}, ${localOrigem.lon.toFixed(6)}<br>
                    Destino: ${localDestino.lat.toFixed(6)}, ${localDestino.lon.toFixed(6)}
                </span>
            </div>
        </div>
        <div class="resultado-acoes">
            <button class="btn-acao" onclick="navigator.clipboard.writeText('${_esc(localOrigem.nome)} → ${_esc(localDestino.nome)}')">
                <svg viewBox="0 0 16 16" fill="none"><rect x="5" y="2" width="9" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5" fill="white"/></svg>
                Copiar rota
            </button>
            <button class="btn-acao" onclick="_compartilharRota()">
                <svg viewBox="0 0 16 16" fill="none"><circle cx="13" cy="3" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="3" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="13" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 7l6-3M5 9l6 3" stroke="currentColor" stroke-width="1.5"/></svg>
                Compartilhar
            </button>
        </div>
    `;
}

function _renderizarComparativoAtual(distanciaKm, duracaoMin) {
    const dist = distanciaKm || window._distanciaAtual || 5;
    const dur  = duracaoMin  || window._duracaoAtual   || 15;
    renderizarComparativo('resultado-conteudo', dist, dur);
}

function _atualizarStatsBar(distanciaKm, duracaoMin) {
    window._distanciaAtual = distanciaKm;
    window._duracaoAtual   = duracaoMin;

    const elDist  = document.getElementById('statDistancia');
    const elTempo = document.getElementById('statTempo');
    const elRotas = document.getElementById('statRotas');

    if (elDist  && distanciaKm) elDist.textContent  = `${distanciaKm} km`;
    if (elTempo && duracaoMin)  elTempo.textContent  = `~${duracaoMin} min`;
    if (elRotas) elRotas.textContent = String(contadorBuscas);
}

function renderizarPainelLateral() {
    renderizarHistorico('resultado-conteudo', reutilizarRota);
}

function reutilizarRota(origem, destino) {
    inputOrigem.value  = origem.nome;
    inputDestino.value = destino.nome;
    localOrigem  = origem;
    localDestino = destino;
    buscarRota();
}

function usarFavorito(favorito) {
    inputOrigem.value = favorito.endereco || favorito.nome;
    localOrigem = { nome: favorito.endereco || favorito.nome, lat: favorito.lat, lon: favorito.lon };
}

async function buscarSugestoesInput(tipo) {
    const input       = tipo === 'origem' ? inputOrigem : inputDestino;
    const sugestoesId = `sugestoes${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    const sugestoesDiv = document.getElementById(sugestoesId);
    const termo = input.value.trim();

    if (!sugestoesDiv) return;
    if (termo.length < 2) { sugestoesDiv.style.display = 'none'; return; }

    try {
        const sugestoes = await buscarSugestoes(termo);
        if (!sugestoes.length) { sugestoesDiv.style.display = 'none'; return; }

        sugestoesDiv.innerHTML = sugestoes.map(s => `
            <div class="sugestao-item"
                 data-lat="${s.lat}" data-lon="${s.lon}"
                 data-nome="${_esc(s.nome)}">${s.nome}</div>
        `).join('');
        sugestoesDiv.style.display = 'block';

        sugestoesDiv.querySelectorAll('.sugestao-item').forEach(el => {
            el.addEventListener('click', async () => {
                const local = { lat: +el.dataset.lat, lon: +el.dataset.lon, nome: el.dataset.nome };
                input.value = local.nome;
                sugestoesDiv.style.display = 'none';

                if (tipo === 'origem') localOrigem = local;
                else                   localDestino = local;

                if (localOrigem && localDestino) {
                    await buscarRota();
                }
            });
        });
    } catch {
        sugestoesDiv.style.display = 'none';
    }
}

function mostrarLoading(ativo) {
    if (loadingDiv) loadingDiv.style.display = ativo ? 'block' : 'none';
}

function mostrarErro(msg) {
    if (!erroDiv) return;
    erroDiv.textContent = msg;
    erroDiv.style.display = 'block';
    setTimeout(() => { erroDiv.style.display = 'none'; }, 5000);
}

function esconderErro() {
    if (erroDiv) erroDiv.style.display = 'none';
}

function _esc(str) {
    return (str || '').replace(/'/g, "\\'");
}

window._compartilharRota = function() {
    if (!localOrigem || !localDestino) return;
    const texto = `De: ${localOrigem.nome}\nPara: ${localDestino.nome}`;
    if (navigator.share) {
        navigator.share({ title: 'Rota — Centralizador', text: texto });
    } else {
        navigator.clipboard.writeText(texto);
        alert('Rota copiada para a área de transferência!');
    }
};

window.testarBusca = async (origem, destino) => {
    inputOrigem.value  = origem;
    inputDestino.value = destino;
    await buscarRota();
};