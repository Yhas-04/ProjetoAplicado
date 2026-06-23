import { buscarSugestoes } from './nominatim.js';
import { calcularRota } from './mapaLeaflet.js';

const token = localStorage.getItem('auth_token');
if (!token) window.location.href = 'login.html';
const inputOrigem = document.getElementById('origem');
const inputDestino = document.getElementById('destino');
const btnBuscar = document.getElementById('btnBuscar');
const loadingDiv = document.getElementById('loading');
const erroDiv = document.getElementById('erro');
const resultadoDiv = document.getElementById('resultado');
const comparacaoPanel = document.getElementById('comparacao');
const listaApps = document.getElementById('listaApps');
const listaHistorico = document.getElementById('listaHistorico');
const favoritosAppsList = document.getElementById('favoritosAppsList');

let localOrigem = null;
let localDestino = null;
let timeoutSug = null;

// Mapa de aparência visual por provider (o backend não manda cor/logo, então
// mantemos só o "estilo" no front e casamos pelo nome).
const ESTILO_APPS = {
  Simulator: { barColor: '#000000', iconBg: '#E8E8E8', iconColor: '#000', logo: 'S' },
  Uber:      { barColor: '#000000', iconBg: '#E8E8E8', iconColor: '#000', logo: 'U' },
  '99':      { barColor: '#F4C430', iconBg: '#FEF3C7', iconColor: '#9A7B00', logo: '99' },
  inDriver:  { barColor: '#22C55E', iconBg: '#D1FAE5', iconColor: '#16A34A', logo: 'I' },
};
const ESTILO_PADRAO = { barColor: '#6366F1', iconBg: '#E0E7FF', iconColor: '#4338CA', logo: '?' };

function estiloDoProvider(nome) {
  return ESTILO_APPS[nome] || ESTILO_PADRAO;
}

// ---------------------------------------------------------------------
// Chamada real ao backend (Centralizador na porta 8080, via Nginx /api/)
// ---------------------------------------------------------------------
async function compararPrecos(origem, destino) {
  const payload = {
    origin: {
      name: origem.nome,
      latitude: origem.lat,
      longitude: origem.lon,
    },
    destination: {
      name: destino.nome,
      latitude: destino.lat,
      longitude: destino.lon,
    },
  };

  const response = await fetch('/api/ride/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Erro ao consultar preços (HTTP ${response.status})`);
  }

  return response.json(); // formato descrito pelo Centralizador
}

function switchTab(tab) {
  document.querySelectorAll('.nav-tab, .bnav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  const el = document.getElementById(`tab-${tab}`);
  if (el) {
    el.style.display = 'block';
    void el.offsetHeight;
    el.classList.add('active');
  }
  if (tab === 'historico') renderizarHistorico();
  if (tab === 'favoritos') renderizarFavoritos();
  if (tab === 'perfil') atualizarPerfil();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-tab, .bnav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('profileAvatar').addEventListener('click', () => switchTab('perfil'));
document.getElementById('profileName').addEventListener('click', () => switchTab('perfil'));

btnBuscar.addEventListener('click', buscarRota);
[inputOrigem, inputDestino].forEach(inp => {
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') buscarRota(); });
  inp.addEventListener('input', () => agendarSugestoes(inp === inputOrigem ? 'origem' : 'destino'));
});

async function buscarRota() {
  const origemText = inputOrigem.value.trim();
  const destinoText = inputDestino.value.trim();
  if (!origemText || !destinoText) { mostrarErro('Preencha origem e destino.'); return; }

  loadingDiv.style.display = 'flex';
  erroDiv.style.display = 'none';
  comparacaoPanel.style.display = 'none';
  resultadoDiv.style.display = 'none';

  try {
    const { origem, destino, distanciaKm } = await calcularRota(origemText, destinoText);
    localOrigem = origem;
    localDestino = destino;

    // Antes: const precos = simularPrecos(distanciaKm)  -> dados fake no front
    // Agora: pergunta pro Centralizador (8080), que por sua vez consulta
    // o ride-app-simulator (8084) e qualquer outro provider real.
    const comparacao = await compararPrecos(origem, destino);

    renderizarComparacao(comparacao.providers, comparacao.distanceKm);
    renderizarInfoRota(comparacao);
    salvarHistorico(comparacao);
  } catch (err) {
    mostrarErro(err.message || 'Erro ao calcular rota.');
  } finally {
    loadingDiv.style.display = 'none';
  }
}

function renderizarComparacao(providers, distanciaKm) {
  if (!providers || !providers.length) {
    listaApps.innerHTML = '<div class="historico-item" style="justify-content:center;color:#6A6580;">Nenhum app disponível agora.</div>';
    comparacaoPanel.style.display = 'flex';
    return;
  }

  const ordenados = [...providers].sort((a, b) => a.price - b.price);
  const menorPreco = ordenados[0].price;
  const maiorPreco = ordenados[ordenados.length - 1].price;
  const range = maiorPreco - menorPreco || 1;
  const menorEta = Math.min(...ordenados.map(p => p.estimatedTimeMinutes));

  listaApps.innerHTML = ordenados.map(provider => {
    const estilo = estiloDoProvider(provider.providerName);
    const isMelhor = provider.price === menorPreco;
    const isFastest = provider.estimatedTimeMinutes === menorEta;
    const barPct = Math.round(40 + ((provider.price - menorPreco) / range) * 50);
    const barColor = isMelhor ? '#16A34A' : estilo.barColor;
    const btnClass = isMelhor ? '' : 'ghost';

    let badge = '';
    if (isMelhor) badge = `<span class="app-badge">Mais barato</span>`;
    else if (isFastest) badge = `<span class="app-badge" style="background:#FEF3C7;color:#9A7B00;">Mais rápido</span>`;

    return `
      <div class="app-card" onclick="abrirApp('${provider.providerName}')">
        <div class="app-logo" style="background:${estilo.iconBg};color:${estilo.iconColor};">${estilo.logo}</div>
        <div class="app-info">
          <div class="app-nome">${provider.providerName}</div>
          <div class="app-rating">${provider.estimatedTimeMinutes} min</div>
          <div class="app-preco">R$ ${provider.price.toFixed(2)}</div>
          <div class="app-bar"><div class="app-bar-fill" style="width:${barPct}%;background:${barColor};"></div></div>
          ${badge}
        </div>
        <button class="app-btn ${btnClass}" onclick="event.stopPropagation(); abrirApp('${provider.providerName}')">Escolher</button>
      </div>`;
  }).join('');

  comparacaoPanel.style.display = 'flex';
}

function renderizarInfoRota(comparacao) {
  const { distanceKm, providers } = comparacao;
  const precoMedio = providers.length
    ? providers.reduce((acc, p) => acc + p.price, 0) / providers.length
    : 0;

  document.getElementById('distanciaVal').textContent = `${distanceKm.toFixed(1)} km`;
  document.getElementById('tempoVal').textContent = `~${Math.round(distanceKm * 2.5)} min`;
  document.getElementById('appsVal').textContent = `${providers.length} opç${providers.length === 1 ? 'ão' : 'ões'}`;
  document.getElementById('precoVal').textContent = `R$ ${precoMedio.toFixed(2)}`;
  resultadoDiv.style.display = 'flex';
}

function salvarHistorico(comparacao) {
  const { originName, destinationName, distanceKm, providers } = comparacao;
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  hist.unshift({
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    origem: (originName || '').split(',')[0],
    destino: (destinationName || '').split(',')[0],
    distancia: distanceKm.toFixed(1),
    precos: providers.map(p => ({ nome: p.providerName, preco: p.price })),
  });
  localStorage.setItem('historico_corridas', JSON.stringify(hist.slice(0, 30)));
}

function renderizarHistorico() {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  if (!listaHistorico) return;
  if (!hist.length) { listaHistorico.innerHTML = '<div class="historico-item" style="justify-content:center;color:#6A6580;">Nenhuma corrida ainda.</div>'; return; }
  listaHistorico.innerHTML = hist.map(item => {
    const melhor = item.precos.reduce((a, b) => a.preco < b.preco ? a : b);
    return `
      <div class="historico-item">
        <div class="hist-left">
          <div class="hist-logo" style="background:${['#E8E8E8','#FEF3C7','#D1FAE5'][Math.floor(Math.random()*3)]}">${item.precos[0].nome[0]}</div>
          <div class="hist-info"><h5>${item.origem} → ${item.destino}</h5><span>${item.data} · ${item.distancia} km</span></div>
        </div>
        <div class="hist-right">
          <span class="hist-preco">R$ ${melhor.preco.toFixed(2)}</span>
          <span class="hist-status concluida">Concluída</span>
        </div>
      </div>`;
  }).join('');
}

function renderizarFavoritos() {
  if (!favoritosAppsList) return;
  const nomes = Object.keys(ESTILO_APPS);
  favoritosAppsList.innerHTML = nomes.map(nome => {
    const estilo = estiloDoProvider(nome);
    return `
    <div class="app-card-fav">
      <div class="app-logo" style="background:${estilo.iconBg};color:${estilo.iconColor};">${estilo.logo}</div>
      <div class="app-info"><div class="app-nome">${nome}</div></div>
      <button class="app-btn" onclick="abrirApp('${nome}')">Escolher</button>
    </div>`;
  }).join('');
}

function atualizarPerfil() {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  const total = hist.length;
  const gasto = hist.reduce((acc, item) => {
    const melhor = item.precos.reduce((a, b) => a.preco < b.preco ? a : b);
    return acc + melhor.preco;
  }, 0);

  document.querySelectorAll('.perfil-stats-row .stat-item .stat-num').forEach(el => {
    const parent = el.closest('.stat-item');
    if (!parent) return;
    const label = parent.querySelector('.stat-label');
    if (label && label.textContent.trim() === 'Corridas') {
      el.textContent = total;
    }
  });

  const totalCorridas = document.getElementById('totalCorridas');
  const totalGasto = document.getElementById('totalGasto');
  if (totalCorridas) totalCorridas.textContent = total;
  if (totalGasto) totalGasto.textContent = `R$ ${gasto.toFixed(0)}`;
}

document.querySelectorAll('.perfil-menu-item').forEach(item => {
  item.addEventListener('click', function () {
    const title = this.querySelector('.menu-title')?.textContent || '';
    if (title === 'Sair') {
      if (confirm('Tem certeza que deseja sair?')) {
        alert('Sessão encerrada!');
      }
    } else if (title === 'Informações pessoais') {
      alert('Abrindo informações pessoais...');
    } else if (title === 'Segurança') {
      alert('Abrindo configurações de segurança...');
    } else if (title === 'Favoritos') {
      switchTab('favoritos');
    }
  });
});

async function agendarSugestoes(tipo) {
  clearTimeout(timeoutSug);
  timeoutSug = setTimeout(() => carregarSugestoes(tipo), 400);
}

async function carregarSugestoes(tipo) {
  const input = tipo === 'origem' ? inputOrigem : inputDestino;
  const divId = `sugestoes${tipo.charAt(0).toUpperCase()+tipo.slice(1)}`;
  const sugDiv = document.getElementById(divId);
  const termo = input.value.trim();
  if (!sugDiv || termo.length < 2) { if (sugDiv) sugDiv.style.display = 'none'; return; }
  try {
    const lista = await buscarSugestoes(termo);
    if (!lista.length) { sugDiv.style.display = 'none'; return; }
    sugDiv.innerHTML = lista.map(s => `<div class="sugestao-item" data-lat="${s.lat}" data-lon="${s.lon}" data-nome="${s.nome.replace(/"/g,'&quot;')}">${s.nome}</div>`).join('');
    sugDiv.style.display = 'block';
    sugDiv.querySelectorAll('.sugestao-item').forEach(el => {
      el.addEventListener('click', () => {
        input.value = el.dataset.nome;
        sugDiv.style.display = 'none';
        if (tipo === 'origem') localOrigem = { lat: parseFloat(el.dataset.lat), lon: parseFloat(el.dataset.lon), nome: el.dataset.nome };
        else localDestino = { lat: parseFloat(el.dataset.lat), lon: parseFloat(el.dataset.lon), nome: el.dataset.nome };
        if (localOrigem && localDestino) buscarRota();
      });
    });
  } catch { sugDiv.style.display = 'none'; }
}

window.abrirApp = function (providerName) {
  if (!localOrigem || !localDestino) return;
  const { lat: oLat, lon: oLon } = localOrigem;
  const { lat: dLat, lon: dLon } = localDestino;
  const links = {
    Uber: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${oLat}&pickup[longitude]=${oLon}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLon}`,
    '99': 'https://99app.com',
    inDriver: 'https://indriver.com',
  };
  window.open(links[providerName] || '#', '_blank');
};

function mostrarErro(msg) { erroDiv.textContent = msg; erroDiv.style.display = 'block'; setTimeout(() => erroDiv.style.display = 'none', 5000); }

document.addEventListener('DOMContentLoaded', () => {
  renderizarHistorico();
  renderizarFavoritos();
  atualizarPerfil();
});