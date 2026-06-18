import {
    getHistorico, removerHistorico, limparHistorico,
    getFavoritos, salvarFavorito, removerFavorito
} from './storage.js';


export function renderizarHistorico(elementoId, onSelecionar) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    const historico = getHistorico();

    if (historico.length === 0) {
        el.innerHTML = '<p class="lista-vazia">Nenhuma corrida no histórico ainda.</p>';
        return;
    }

    el.innerHTML = `
        <div class="lista-header">
            <span>${historico.length} corrida(s)</span>
            <button class="btn-limpar" id="btnLimparHistorico">Limpar tudo</button>
        </div>
        <ul class="lista-itens">
            ${historico.map(h => `
                <li class="lista-item" data-id="${h.id}">
                    <div class="lista-item-info">
                        <div class="lista-item-rota">
                            <span class="ponto-origem">●</span>
                            <span class="lista-item-nome">${_nomeCurto(h.origem.nome)}</span>
                        </div>
                        <div class="lista-item-rota">
                            <span class="ponto-destino">●</span>
                            <span class="lista-item-nome">${_nomeCurto(h.destino.nome)}</span>
                        </div>
                        <div class="lista-item-meta">
                            ${h.distanciaKm ? `${h.distanciaKm} km · ` : ''}
                            ${_formatarData(h.data)}
                        </div>
                    </div>
                    <div class="lista-item-acoes">
                        <button class="btn-item-acao btn-reutilizar" title="Reutilizar rota"
                            data-origem-nome="${_esc(h.origem.nome)}"
                            data-origem-lat="${h.origem.lat}"
                            data-origem-lon="${h.origem.lon}"
                            data-destino-nome="${_esc(h.destino.nome)}"
                            data-destino-lat="${h.destino.lat}"
                            data-destino-lon="${h.destino.lon}">
                            ↩
                        </button>
                        <button class="btn-item-acao btn-remover" title="Remover" data-id="${h.id}">✕</button>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;

    el.querySelector('#btnLimparHistorico')?.addEventListener('click', () => {
        if (confirm('Limpar todo o histórico?')) {
            limparHistorico();
            renderizarHistorico(elementoId, onSelecionar);
        }
    });

    el.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', () => {
            removerHistorico(Number(btn.dataset.id));
            renderizarHistorico(elementoId, onSelecionar);
        });
    });

    el.querySelectorAll('.btn-reutilizar').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof onSelecionar === 'function') {
                onSelecionar(
                    { nome: btn.dataset.origemNome, lat: +btn.dataset.origemLat, lon: +btn.dataset.origemLon },
                    { nome: btn.dataset.destinoNome, lat: +btn.dataset.destinoLat, lon: +btn.dataset.destinoLon }
                );
            }
        });
    });
}


export function renderizarFavoritos(elementoId, onSelecionar) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    const favoritos = getFavoritos();

    el.innerHTML = `
        ${favoritos.length === 0
            ? '<p class="lista-vazia">Nenhum favorito salvo ainda.</p>'
            : `<ul class="lista-itens">
                ${favoritos.map(f => `
                    <li class="lista-item" data-nome="${_esc(f.nome)}">
                        <div class="lista-item-info">
                            <div class="favorito-icone-nome">
                                <span class="favorito-icone">${_iconeLabel(f.nome)}</span>
                                <span class="favorito-nome">${f.nome}</span>
                            </div>
                            <div class="lista-item-meta">${_nomeCurto(f.endereco)}</div>
                        </div>
                        <div class="lista-item-acoes">
                            <button class="btn-item-acao btn-usar-fav" title="Usar como origem"
                                data-lat="${f.lat}" data-lon="${f.lon}" data-nome="${_esc(f.nome)}" data-endereco="${_esc(f.endereco)}">
                                ↑
                            </button>
                            <button class="btn-item-acao btn-remover" title="Remover" data-nome="${_esc(f.nome)}">✕</button>
                        </div>
                    </li>
                `).join('')}
            </ul>`
        }
        <div class="favorito-adicionar">
            <input type="text" id="inputNomeFavorito" placeholder="Nome (ex: Casa, Trabalho)" maxlength="30">
            <button class="btn-add-fav" id="btnAdicionarFavorito">+ Adicionar local atual</button>
        </div>
    `;

    el.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', () => {
            removerFavorito(btn.dataset.nome);
            renderizarFavoritos(elementoId, onSelecionar);
        });
    });

    el.querySelectorAll('.btn-usar-fav').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof onSelecionar === 'function') {
                onSelecionar({
                    nome:     btn.dataset.nome,
                    lat:      +btn.dataset.lat,
                    lon:      +btn.dataset.lon,
                    endereco: btn.dataset.endereco
                });
            }
        });
    });

    el.querySelector('#btnAdicionarFavorito')?.addEventListener('click', () => {
        const nomeInput = el.querySelector('#inputNomeFavorito');
        const nome = nomeInput?.value.trim();
        if (!nome) { alert('Digite um nome para o favorito.'); return; }

        const localAtual = window._localOrigemAtual || window._localDestinoAtual;
        if (!localAtual) { alert('Busque uma rota primeiro para salvar o local.'); return; }

        salvarFavorito(nome, localAtual);
        nomeInput.value = '';
        renderizarFavoritos(elementoId, onSelecionar);
    });
}


function _nomeCurto(nome) {
    if (!nome) return '';
    const partes = nome.split(',');
    return partes.slice(0, 2).join(',').trim();
}

function _formatarData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function _esc(str) {
    return (str || '').replace(/"/g, '&quot;');
}

function _iconeLabel(nome) {
    const n = nome.toLowerCase();
    if (n.includes('casa') || n.includes('home'))       return '🏠';
    if (n.includes('trabalho') || n.includes('serviço')) return '💼';
    if (n.includes('academia') || n.includes('gym'))    return '💪';
    if (n.includes('escola') || n.includes('facul'))    return '🎓';
    if (n.includes('mercado') || n.includes('super'))   return '🛒';
    return '📍';
}