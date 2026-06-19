const HISTORICO_KEY = 'centralizador_historico';
const FAVORITOS_KEY = 'centralizador_favoritos';
const MAX_HISTORICO  = 20;


export function salvarHistorico(origem, destino, distanciaKm) {
    const historico = getHistorico();
    const entrada = {
        id: Date.now(),
        origem:      { nome: origem.nome, lat: origem.lat, lon: origem.lon },
        destino:     { nome: destino.nome, lat: destino.lat, lon: destino.lon },
        distanciaKm: distanciaKm || null,
        data:        new Date().toISOString()
    };
    historico.unshift(entrada);
    if (historico.length > MAX_HISTORICO) historico.length = MAX_HISTORICO;
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
    return entrada;
}

export function getHistorico() {
    try {
        return JSON.parse(localStorage.getItem(HISTORICO_KEY)) || [];
    } catch { return []; }
}

export function removerHistorico(id) {
    const historico = getHistorico().filter(h => h.id !== id);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
}

export function limparHistorico() {
    localStorage.removeItem(HISTORICO_KEY);
}


export function salvarFavorito(nome, local) {
    const favoritos = getFavoritos();
    const existente = favoritos.findIndex(f => f.nome === nome);
    const favorito = { nome, lat: local.lat, lon: local.lon, endereco: local.nome };
    if (existente >= 0) {
        favoritos[existente] = favorito;
    } else {
        favoritos.push(favorito);
    }
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
    return favorito;
}

export function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
    } catch { return []; }
}

export function removerFavorito(nome) {
    const favoritos = getFavoritos().filter(f => f.nome !== nome);
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
}