import { buscarSugestoes } from './nominatim.js';
import { calcularRota } from './mapaLeaflet.js';

const token = localStorage.getItem('auth_token');
if (!token) window.location.href = 'login.html';

const inputOrigem = document.getElementById('origem');
const inputDestino = document.getElementById('destino');
const btnBuscar = document.getElementById('btnBuscar');
const btnFavoritar = document.getElementById('btnFavoritar');
const loadingDiv = document.getElementById('loading');
const erroDiv = document.getElementById('erro');
const resultadoDiv = document.getElementById('resultado');
const comparacaoPanel = document.getElementById('comparacao');
const listaApps = document.getElementById('listaApps');
const listaHistorico = document.getElementById('listaHistorico');
const rotasFavoritasContainer = document.getElementById('rotasFavoritasContainer');

let localOrigem = null;
let localDestino = null;
let timeoutSug = null;
let ultimaComparacao = null;

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
  if (tab === 'favoritos') renderizarRotasFavoritas();
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

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

  return response.json();
}

async function buscarRota() {
  const origemText = inputOrigem.value.trim();
  const destinoText = inputDestino.value.trim();
  if (!origemText || !destinoText) { mostrarErro('Preencha origem e destino.'); return; }

  loadingDiv.style.display = 'flex';
  erroDiv.style.display = 'none';
  comparacaoPanel.style.display = 'none';
  resultadoDiv.style.display = 'none';

  try {
    let origem, destino, distanciaKm;
    
    if (localOrigem && localDestino) {
      origem = localOrigem;
      destino = localDestino;
      distanciaKm = calcularDistancia(origem.lat, origem.lon, destino.lat, destino.lon);
    } else {
      const resultado = await calcularRota(origemText, destinoText);
      origem = resultado.origem;
      destino = resultado.destino;
      distanciaKm = resultado.distanciaKm;
    }

    localOrigem = origem;
    localDestino = destino;

    const comparacao = await compararPrecos(origem, destino);
    ultimaComparacao = comparacao;

    salvarHistorico(comparacao);

    renderizarComparacao(comparacao.providers, comparacao.distanceKm || distanciaKm);
    renderizarInfoRota(comparacao);
    atualizarBotaoFavoritar();
  } catch (err) {
    console.error('Erro na busca:', err);
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

  document.getElementById('panelRoute').textContent = `${localOrigem.nome.split(',')[0]} → ${localDestino.nome.split(',')[0]}`;
  document.getElementById('panelDistancia').textContent = (distanciaKm || 0).toFixed(1);
  document.getElementById('panelTempo').textContent = Math.round((distanciaKm || 0) * 2.5);
  document.getElementById('panelApps').textContent = providers.length;

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
  const precoMedio = providers && providers.length
    ? providers.reduce((acc, p) => acc + p.price, 0) / providers.length
    : 0;

  document.getElementById('distanciaVal').textContent = `${(distanceKm || 0).toFixed(1)} km`;
  document.getElementById('tempoVal').textContent = `~${Math.round((distanceKm || 0) * 2.5)} min`;
  document.getElementById('appsVal').textContent = `${providers ? providers.length : 0} opç${providers && providers.length === 1 ? 'ão' : 'ões'}`;
  document.getElementById('precoVal').textContent = `R$ ${precoMedio.toFixed(2)}`;
  resultadoDiv.style.display = 'flex';
}

// ========== HISTÓRICO (localStorage) ==========

function salvarHistorico(comparacao) {
  const { originName, destinationName, distanceKm, providers } = comparacao;
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  hist.unshift({
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    origem: (originName || '').split(',')[0],
    destino: (destinationName || '').split(',')[0],
    distancia: (distanceKm || 0).toFixed(1),
    precos: providers ? providers.map(p => ({ nome: p.providerName, preco: p.price })) : [],
  });
  localStorage.setItem('historico_corridas', JSON.stringify(hist.slice(0, 30)));
}

function renderizarHistorico() {
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  if (!listaHistorico) return;
  if (!hist.length) { 
    listaHistorico.innerHTML = '<div class="historico-item" style="justify-content:center;color:#6A6580;">Nenhuma corrida ainda.</div>'; 
    return; 
  }
  listaHistorico.innerHTML = hist.map(item => {
    const melhor = item.precos && item.precos.length ? item.precos.reduce((a, b) => a.preco < b.preco ? a : b) : { preco: 0 };
    return `
      <div class="historico-item">
        <div class="hist-left">
          <div class="hist-logo" style="background:${['#E8E8E8','#FEF3C7','#D1FAE5'][Math.floor(Math.random()*3)]}">${item.precos && item.precos.length ? item.precos[0].nome[0] : '?'}</div>
          <div class="hist-info"><h5>${item.origem} → ${item.destino}</h5><span>${item.data} · ${item.distancia} km</span></div>
        </div>
        <div class="hist-right">
          <span class="hist-preco">R$ ${melhor.preco.toFixed(2)}</span>
          <span class="hist-status concluida">Concluída</span>
        </div>
      </div>`;
  }).join('');
}

// ========== FAVORITOS (localStorage) ==========

function salvarRotaFavorita(origem, destino, providers, distanciaKm) {
  const favoritos = JSON.parse(localStorage.getItem('rotas_favoritas') || '[]');
  
  const existe = favoritos.some(r => 
    r.origem.nome === origem.nome && 
    r.destino.nome === destino.nome
  );
  
  if (existe) {
    mostrarNotificacao('Esta rota já está nos favoritos!', 'warning');
    return false;
  }
  
  const precoMedio = providers && providers.length 
    ? providers.reduce((acc, p) => acc + p.price, 0) / providers.length 
    : 0;
  
  const melhorPreco = providers && providers.length
    ? Math.min(...providers.map(p => p.price))
    : 0;
  
  const rota = {
    id: Date.now(),
    origem: {
      nome: origem.nome,
      lat: origem.lat,
      lon: origem.lon
    },
    destino: {
      nome: destino.nome,
      lat: destino.lat,
      lon: destino.lon
    },
    distanciaKm: distanciaKm || 0,
    precoMedio: precoMedio,
    melhorPreco: melhorPreco,
    providers: providers || [],
    dataCriacao: new Date().toISOString(),
    vezesUsada: 0,
    ultimoUso: null
  };
  
  favoritos.unshift(rota);
  localStorage.setItem('rotas_favoritas', JSON.stringify(favoritos));
  
  mostrarNotificacao('Rota favoritada com sucesso! ❤️', 'success');
  renderizarRotasFavoritas();
  atualizarBotaoFavoritar();
  return true;
}

function removerRotaFavorita(id) {
  let favoritos = JSON.parse(localStorage.getItem('rotas_favoritas') || '[]');
  favoritos = favoritos.filter(r => r.id !== id);
  localStorage.setItem('rotas_favoritas', JSON.stringify(favoritos));
  renderizarRotasFavoritas();
  atualizarBotaoFavoritar();
  mostrarNotificacao('Rota removida dos favoritos', 'info');
}

function isRotaFavoritada(origemNome, destinoNome) {
  const favoritos = JSON.parse(localStorage.getItem('rotas_favoritas') || '[]');
  return favoritos.some(r => 
    r.origem.nome === origemNome && 
    r.destino.nome === destinoNome
  );
}

function renderizarRotasFavoritas() {
  if (!rotasFavoritasContainer) return;
  
  const favoritos = JSON.parse(localStorage.getItem('rotas_favoritas') || '[]');
  document.getElementById('favoritosTotal').textContent = favoritos.length;
  
  if (!favoritos.length) {
    rotasFavoritasContainer.innerHTML = `
      <div class="favoritos-empty" style="grid-column: 1 / -1;">
        <i class="ti ti-heart" style="font-size: 48px; color: #d1d5db;"></i>
        <p style="color: #6A6580; margin-top: 12px;">Nenhuma rota favoritada ainda.</p>
        <p style="color: #9CA3AF; font-size: 13px;">Faça uma busca e clique em "Favoritar Rota"</p>
      </div>
    `;
    return;
  }
  
  rotasFavoritasContainer.innerHTML = favoritos.map(rota => {
    const providersHtml = rota.providers && rota.providers.length
      ? rota.providers.map(p => `<span class="provider-tag">${p.providerName}</span>`).join('')
      : '<span style="color: #9CA3AF; font-size: 11px;">Nenhum app disponível</span>';
    
    const dataFormatada = new Date(rota.dataCriacao).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    return `
      <div class="rota-card favorita" data-id="${rota.id}">
        <div class="rota-icon">📍</div>
        <div style="flex:1; min-width:0;">
          <div class="rota-nome">${rota.origem.nome.split(',')[0]} → ${rota.destino.nome.split(',')[0]}</div>
          <div class="rota-meta">
            ${rota.distanciaKm.toFixed(1)} km · 
            R$ ${rota.melhorPreco.toFixed(2)} · 
            ${dataFormatada}
            ${rota.vezesUsada > 0 ? ` · ${rota.vezesUsada}x usada` : ''}
          </div>
          <div class="rota-providers">${providersHtml}</div>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          <span class="rota-tag" style="background: #FEF3C7; color: #9A7B00;">❤️</span>
          <button class="btn-remover-fav" data-id="${rota.id}">
            <i class="ti ti-trash" style="font-size: 16px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  rotasFavoritasContainer.querySelectorAll('.btn-remover-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      if (confirm('Remover esta rota dos favoritos?')) {
        removerRotaFavorita(id);
      }
    });
  });
  
  rotasFavoritasContainer.querySelectorAll('.rota-card.favorita').forEach(card => {
    card.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      const favoritos = JSON.parse(localStorage.getItem('rotas_favoritas') || '[]');
      const rota = favoritos.find(r => r.id === id);
      if (rota) {
        document.getElementById('origem').value = rota.origem.nome;
        document.getElementById('destino').value = rota.destino.nome;
        localOrigem = rota.origem;
        localDestino = rota.destino;
        rota.vezesUsada = (rota.vezesUsada || 0) + 1;
        rota.ultimoUso = new Date().toISOString();
        localStorage.setItem('rotas_favoritas', JSON.stringify(favoritos));
        buscarRota();
        switchTab('busca');
      }
    });
  });
}

function atualizarBotaoFavoritar() {
  if (!btnFavoritar || !localOrigem || !localDestino) return;
  
  const isFav = isRotaFavoritada(localOrigem.nome, localDestino.nome);
  if (isFav) {
    btnFavoritar.innerHTML = '<i class="ti ti-heart-filled"></i> Favoritado';
    btnFavoritar.classList.add('ativo');
  } else {
    btnFavoritar.innerHTML = '<i class="ti ti-heart"></i> Favoritar Rota';
    btnFavoritar.classList.remove('ativo');
  }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  const cores = {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#6C5DD3'
  };
  
  toast.style.borderLeftColor = cores[tipo] || cores.info;
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function fazerLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}

function atualizarPerfil() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      document.querySelectorAll('.perfil-avatar-large, .perfil-avatar').forEach(el => {
        if (el) el.textContent = user.name ? user.name.substring(0, 2).toUpperCase() : 'U1';
      });
      document.querySelectorAll('.perfil-user-info h2, .perfil-user-info .perfil-name').forEach(el => {
        if (el) el.textContent = user.name || 'Usuário';
      });
      document.querySelectorAll('.perfil-email').forEach(el => {
        if (el) el.textContent = user.email || 'usuario@email.com';
      });
    }
  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
  }
  
  const hist = JSON.parse(localStorage.getItem('historico_corridas') || '[]');
  const total = hist.length;
  const gasto = hist.reduce((acc, item) => {
    if (!item.precos || !item.precos.length) return acc;
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
      fazerLogout();
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
    
    const newSugDiv = sugDiv.cloneNode(true);
    sugDiv.parentNode.replaceChild(newSugDiv, sugDiv);
    
    newSugDiv.querySelectorAll('.sugestao-item').forEach(el => {
      el.addEventListener('click', () => {
        const nome = el.dataset.nome;
        const lat = parseFloat(el.dataset.lat);
        const lon = parseFloat(el.dataset.lon);
        
        input.value = nome;
        newSugDiv.style.display = 'none';
        
        if (tipo === 'origem') {
          localOrigem = { lat, lon, nome };
        } else {
          localDestino = { lat, lon, nome };
        }
        
        if (localOrigem && localDestino) {
          buscarRota();
        }
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

function mostrarErro(msg) { 
  erroDiv.textContent = msg; 
  erroDiv.style.display = 'block'; 
  setTimeout(() => erroDiv.style.display = 'none', 5000); 
}

btnFavoritar.addEventListener('click', () => {
  if (!localOrigem || !localDestino) {
    mostrarNotificacao('Faça uma busca primeiro!', 'warning');
    return;
  }
  
  if (!ultimaComparacao) {
    mostrarNotificacao('Faça uma busca primeiro!', 'warning');
    return;
  }
  
  salvarRotaFavorita(
    localOrigem, 
    localDestino, 
    ultimaComparacao.providers, 
    ultimaComparacao.distanceKm
  );
});

document.addEventListener('DOMContentLoaded', () => {
  renderizarHistorico();
  renderizarRotasFavoritas();
  atualizarPerfil();
  atualizarBotaoFavoritar();
});