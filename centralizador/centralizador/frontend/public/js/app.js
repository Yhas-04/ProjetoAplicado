import { buscarSugestoes } from './nominatim.js';
import { calcularRota } from './mapaLeaflet.js';

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

const APPS = [
  { id: 'uber', nome: 'UberX', barColor: '#000000', iconBg: '#E8E8E8', iconColor: '#000', logo: 'U', etaMin: 3, etaMax: 8, fatorKm: 2.4, fatorBase: 5.5 },
  { id: '99', nome: '99', barColor: '#F4C430', iconBg: '#FEF3C7', iconColor: '#9A7B00', logo: '99', etaMin: 4, etaMax: 10, fatorKm: 2.1, fatorBase: 4.8 },
  { id: 'indriver', nome: 'inDriver', barColor: '#22C55E', iconBg: '#D1FAE5', iconColor: '#16A34A', logo: 'I', etaMin: 5, etaMax: 12, fatorKm: 1.9, fatorBase: 4.2 },
];

function simularPrecos(distanciaKm) {
  return APPS.map(app => {
    const variacao = 1 + (Math.random() - 0.5) * 0.15;
    const preco = (app.fatorBase + distanciaKm * app.fatorKm) * variacao;
    const eta = app.etaMin + Math.floor(Math.random() * (app.etaMax - app.etaMin));
    return { ...app, preco, eta };
  });
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
    const precos = simularPrecos(distanciaKm);
    renderizarComparacao(precos, distanciaKm);
    renderizarInfoRota(origem, destino, distanciaKm);
    salvarHistorico(origem, destino, distanciaKm, precos);
  } catch (err) {
    mostrarErro(err.message || 'Erro ao calcular rota.');
  } finally {
    loadingDiv.style.display = 'none';
  }
}

function renderizarComparacao(precos, distanciaKm) {
  const ordenados = [...precos].sort((a, b) => a.preco - b.preco);
  const menorPreco = ordenados[0].preco;
  const maiorPreco = ordenados[ordenados.length - 1].preco;
  const range = maiorPreco - menorPreco || 1;

  listaApps.innerHTML = ordenados.map((app, i) => {
    const isMelhor = app.preco === menorPreco;
    const isFastest = app.eta === Math.min(...ordenados.map(a => a.eta));
    const barPct = Math.round(40 + ((app.preco - menorPreco) / range) * 50);
    const barColor = isMelhor ? '#16A34A' : app.barColor;
    const btnClass = isMelhor ? '' : 'ghost';
    let badge = '';
    if (isMelhor) badge = `<span class="app-badge">Mais barato</span>`;
    else if (isFastest) badge = `<span class="app-badge" style="background:#FEF3C7;color:#9A7B00;">Mais rápido</span>`;

    return `
      <div class="app-card" onclick="abrirApp('${app.id}')">
        <div class="app-logo" style="background:${app.iconBg};color:${app.iconColor};">${app.logo}</div>
        <div class="app-info">
          <div class="app-nome">${app.nome}</div>
          <div class="app-rating">★ ${(4.5 + Math.random()*0.5).toFixed(1)} · ${app.eta} min</div>
          <div class="app-preco">R$ ${app.preco.toFixed(2)}</div>
          <div class="app-bar"><div class="app-bar-fill" style="width:${barPct}%;background:${barColor};"></div></div>
          ${badge}
        </div>
        <button class="app-btn ${btnClass}" onclick="event.stopPropagation(); abrirApp('${app.id}')">Escolher</button>
      </div>`;
  }).join('');

  comparacaoPanel.style.display = 'flex';
}

function renderizarInfoRota(origem, destino, distanciaKm) {
  document.getElementById('distanciaVal').textContent = `${distanciaKm.toFixed(1)} km`;
  document.getElementById('tempoVal').textContent = `~${Math.round(distanciaKm * 2.5)} min`;
  document.getElementById('appsVal').textContent = `4 opções`;
  document.getElementById('precoVal').textContent = `R$ ${(APPS.reduce((acc,a) => acc + (a.fatorBase + distanciaKm*a.fatorKm), 0)/APPS.length).toFixed(2)}`;
  resultadoDiv.style.display = 'flex';
}

function salvarHistorico(origem, destino, distanciaKm, precos) {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  hist.unshift({ id: Date.now(), data: new Date().toLocaleString('pt-BR'), origem: origem.nome.split(',')[0], destino: destino.nome.split(',')[0], distancia: distanciaKm.toFixed(1), precos: precos.map(p => ({ nome: p.nome, preco: p.preco })) });
  localStorage.setItem('historico_corridas', JSON.stringify(hist.slice(0, 30)));
}

function renderizarHistorico() {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  if (!listaHistorico) return;
  if (!hist.length) { listaHistorico.innerHTML = '<div class="historico-item" style="justify-content:center;color:#6A6580;">Nenhuma corrida ainda.</div>'; return; }
  listaHistorico.innerHTML = hist.map(item => {
    const melhor = item.precos.reduce((a,b) => a.preco < b.preco ? a : b);
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
  favoritosAppsList.innerHTML = APPS.map(app => `
    <div class="app-card-fav">
      <div class="app-logo" style="background:${app.iconBg};color:${app.iconColor};">${app.logo}</div>
      <div class="app-info"><div class="app-nome">${app.nome}</div><div class="app-rating">★ ${(4.5+Math.random()*0.5).toFixed(1)} · ${app.etaMin+Math.floor(Math.random()*3)} min</div><div class="app-preco" style="font-size:18px;">R$ ${(app.fatorBase+Math.random()*10).toFixed(2)}</div></div>
      <button class="app-btn" onclick="abrirApp('${app.id}')">Escolher</button>
    </div>`).join('');
}

function atualizarPerfil() {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  const total = hist.length;
  const gasto = hist.reduce((acc, item) => {
    const melhor = item.precos.reduce((a, b) => a.preco < b.preco ? a : b);
    return acc + melhor.preco;
  }, 0);
  const avaliacao = total > 0 ? (4.5 + Math.random() * 0.5) : 0;

  document.querySelectorAll('.perfil-stats-row .stat-item .stat-num').forEach(el => {
    const parent = el.closest('.stat-item');
    if (!parent) return;
    const label = parent.querySelector('.stat-label');
    if (label && label.textContent.trim() === 'Corridas') {
      el.textContent = total;
    }
    if (label && label.textContent.trim() === 'Avaliação') {
      el.textContent = avaliacao.toFixed(1) + ' ★';
    }
  });

  const totalCorridas = document.getElementById('totalCorridas');
  const totalGasto = document.getElementById('totalGasto');
  const avaliacaoMedia = document.getElementById('avaliacaoMedia');
  if (totalCorridas) totalCorridas.textContent = total;
  if (totalGasto) totalGasto.textContent = `R$ ${gasto.toFixed(0)}`;
  if (avaliacaoMedia) avaliacaoMedia.textContent = avaliacao.toFixed(1) + ' ★';
}

document.querySelectorAll('.perfil-menu-item').forEach(item => {
  item.addEventListener('click', function(e) {
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

document.querySelectorAll('.perfil-menu-item').forEach(item => {
  item.addEventListener('click', function() {
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

window.abrirApp = function(appId) {
  if (!localOrigem || !localDestino) return;
  const { lat: oLat, lon: oLon } = localOrigem;
  const { lat: dLat, lon: dLon } = localDestino;
  const links = { uber: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${oLat}&pickup[longitude]=${oLon}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLon}`, '99': 'https://99app.com', indriver: 'https://indriver.com' };
  window.open(links[appId] || '#', '_blank');
};

function mostrarErro(msg) { erroDiv.textContent = msg; erroDiv.style.display = 'block'; setTimeout(()=>erroDiv.style.display='none', 5000); }

document.addEventListener('DOMContentLoaded', () => {
  renderizarHistorico();
  renderizarFavoritos();
  atualizarPerfil();
});