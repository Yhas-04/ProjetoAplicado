const API_BASE = '';

if (localStorage.getItem('auth_token')) {
    window.location.href = 'index.html';
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="loading-spinner"></span>Cadastrando...'
        : 'Criar conta';
}

function mostrarErro(msg) {
    const el = document.getElementById('msgErro');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

function esconderErro() {
    const el = document.getElementById('msgErro');
    if (el) {
        el.style.display = 'none';
    }
}

function checkStrength(senha) {
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');
    const label = document.getElementById('strengthLabel');
    
    if (!bar1 || !bar2 || !bar3 || !label) return;
    
    // Reseta as barras
    [bar1, bar2, bar3].forEach(bar => {
        bar.style.background = '#e5e7eb';
    });
    
    if (senha.length === 0) {
        label.textContent = '';
        label.style.color = '#6A6580';
        return;
    }
    
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.length >= 10) forca++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/\d/.test(senha)) forca++;
    if (/[^a-zA-Z0-9]/.test(senha)) forca++;
    
    // Calcula nível (0-3)
    let nivel = 0;
    if (forca <= 2) nivel = 1;
    else if (forca <= 3) nivel = 2;
    else nivel = 3;
    
    // Aplica cores
    const cores = ['#DC2626', '#F59E0B', '#16A34A'];
    const textos = ['', 'Fraca', 'Média', 'Forte'];
    
    for (let i = 0; i < nivel; i++) {
        const bar = [bar1, bar2, bar3][i];
        if (bar) {
            bar.style.background = cores[nivel - 1];
        }
    }
    
    label.textContent = senha.length > 0 ? textos[nivel] : '';
    label.style.color = cores[nivel - 1] || '#6A6580';
}

async function cadastrar() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // Esconde mensagens anteriores
    esconderErro();
    document.getElementById('msgSucesso').style.display = 'none';

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarErro('Preencha todos os campos.');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarErro('As senhas não coincidem.');
        return;
    }

    if (senha.length < 6) {
        mostrarErro('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    const btn = document.getElementById('btnCadastrar');
    setLoading(btn, true);

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, email, password: senha }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('auth_token', data.token);
            window.location.href = 'index.html';
        } else {
            const error = await response.json().catch(() => ({}));
            mostrarErro(error.message || 'Erro ao cadastrar. Tente novamente.');
        }
    } catch {
        mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
        setLoading(btn, false);
    }
}

// Permite cadastro com Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        cadastrar();
    }
});