const API_BASE = '';

if (localStorage.getItem('auth_token')) {
    window.location.href = 'index.html';
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="loading-spinner"></span>Entrando...'
        : 'Entrar';
}

function mostrarErro(msg) {
    const el = document.getElementById('msgErro');
    el.textContent = msg;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('msgErro').style.display = 'none';
}

async function executarLogin(email, senha) {
    if (!email || !senha) {
        mostrarErro('Preencha e-mail e senha.');
        return;
    }

    const btn = document.getElementById('btnEntrar');
    esconderErro();
    setLoading(btn, true);

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: senha }),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('auth_token', data.token);
            window.location.href = 'index.html';
        } else if (res.status === 400 || res.status === 401) {
            mostrarErro('E-mail ou senha inválidos.');
        } else {
            mostrarErro('Erro ao fazer login. Tente novamente.');
        }
    } catch {
        mostrarErro('Não foi possível conectar ao servidor.');
    } finally {
        setLoading(btn, false);
    }
}

function login() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    executarLogin(email, senha);
}

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
});