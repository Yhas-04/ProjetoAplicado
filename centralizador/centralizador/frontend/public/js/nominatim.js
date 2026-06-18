const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'centralizador/1.0';


async function buscarCoordenadas(endereco) {
    if (!endereco || endereco.trim().length < 3) {
        throw new Error('Digite um endereço válido (mínimo 3 caracteres)');
    }

    const params = new URLSearchParams({
        q: endereco,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        'accept-language': 'pt-BR'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
    }

    const dados = await response.json();

    if (!dados || dados.length === 0) {
        throw new Error('Endereço não encontrado');
    }

    const resultado = dados[0];
    return {
        lat: parseFloat(resultado.lat),
        lon: parseFloat(resultado.lon),
        nome: resultado.display_name
    };
}

async function buscarSugestoes(termo) {
    if (!termo || termo.length < 2) return [];

    const params = new URLSearchParams({
        q: termo,
        format: 'json',
        limit: 5,
        'accept-language': 'pt-BR'
    });

    try {
        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { 'User-Agent': USER_AGENT }
        });

        if (!response.ok) return [];
        const dados = await response.json();

        return dados.map(item => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            nome: item.display_name
        }));
    } catch {
        return [];
    }
}
export { buscarCoordenadas, buscarSugestoes };
