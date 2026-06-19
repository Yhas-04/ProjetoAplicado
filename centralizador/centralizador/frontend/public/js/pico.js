const FAIXAS_PICO = [
    { inicio: 7,  fim: 9,  label: 'Pico manhã',       cor: '#f59e0b' },
    { inicio: 11, fim: 13, label: 'Pico almoço',       cor: '#f59e0b' },
    { inicio: 17, fim: 19, label: 'Pico fim de tarde', cor: '#ef4444' },
    { inicio: 21, fim: 23, label: 'Pico noturno',      cor: '#8b5cf6' },
];

const MULTIPLICADORES_PICO = {
    7:  1.3,
    8:  1.5,
    9:  1.2,
    11: 1.2,
    12: 1.4,
    13: 1.2,
    17: 1.3,
    18: 1.6,
    19: 1.4,
    21: 1.2,
    22: 1.3,
    23: 1.2,
};

/**
 * 
 * @returns {{ emPico: boolean, faixa: object|null, multiplicador: number, hora: number }}
 */
export function getStatusPico() {
    const agora = new Date();
    const hora  = agora.getHours();

    const faixa = FAIXAS_PICO.find(f => hora >= f.inicio && hora <= f.fim) || null;
    const multiplicador = MULTIPLICADORES_PICO[hora] || 1.0;

    return {
        emPico: !!faixa,
        faixa,
        multiplicador,
        hora,
        minuto: agora.getMinutes()
    };
}

export function aplicarPico(precoBase) {
    const { multiplicador } = getStatusPico();
    return +(precoBase * multiplicador).toFixed(2);
}

export function renderizarBannerPico(elementoId) {
    const el = document.getElementById(elementoId);
    if (!el) return;

    const { emPico, faixa, multiplicador, hora, minuto } = getStatusPico();
    const horaFormatada = `${String(hora).padStart(2,'0')}:${String(minuto).padStart(2,'0')}`;

    if (emPico) {
        el.innerHTML = `
            <div class="pico-banner pico-ativo" style="border-color:${faixa.cor}">
                <div class="pico-icone">⚡</div>
                <div class="pico-info">
                    <span class="pico-titulo">${faixa.label} — ${horaFormatada}</span>
                    <span class="pico-subtitulo">
                        Tarifas podem estar até <strong>${Math.round((multiplicador - 1) * 100)}% mais altas</strong> agora
                    </span>
                </div>
                <div class="pico-badge" style="background:${faixa.cor}">
                    ${multiplicador.toFixed(1)}x
                </div>
            </div>
        `;
    } else {
        const proxima = FAIXAS_PICO.find(f => f.inicio > hora);
        const textoProxima = proxima
            ? `Próximo pico às ${proxima.inicio}h (${proxima.label.toLowerCase()})`
            : 'Sem pico previsto hoje';

        el.innerHTML = `
            <div class="pico-banner pico-normal">
                <div class="pico-icone">✅</div>
                <div class="pico-info">
                    <span class="pico-titulo">Fora do horário de pico — ${horaFormatada}</span>
                    <span class="pico-subtitulo">${textoProxima}</span>
                </div>
                <div class="pico-badge pico-badge-normal">1.0x</div>
            </div>
        `;
    }
}