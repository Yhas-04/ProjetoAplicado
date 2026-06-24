const API_BASE = '';

// Redireciona se já estiver logado
if (localStorage.getItem('auth_token')) {
    window.location.href = 'index.html';
}

function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="loading-spinner"></span>Entrando...'
        : 'Entrar';
}

function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
}

function esconderErro(id) {
    document.getElementById(id).style.display = 'none';
}

async function executarLogin(email, senha, btnId, erroId) {
    if (!email || !senha) {
        mostrarErro(erroId, 'Preencha e-mail e senha.');
        return;
    }

    const btn = document.getElementById(btnId);
    esconderErro(erroId);
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
            mostrarErro(erroId, 'E-mail ou senha inválidos.');
        } else {
            mostrarErro(erroId, 'Erro ao fazer login. Tente novamente.');
        }
    } catch {
        mostrarErro(erroId, 'Não foi possível conectar ao servidor.');
    } finally {
        setLoading(btn, false);
    }
}

function getFields() {
    const mobile = window.innerWidth <= 768;
    return mobile
        ? { email: 'emailMobile', senha: 'senhaMobile', btn: 'btnEntrarMobile', erro: 'msgErroMobile' }
        : { email: 'email',       senha: 'senha',       btn: 'btnEntrar',       erro: 'msgErro'       };
}

function login() {
    const f = getFields();
    executarLogin(
        document.getElementById(f.email).value.trim(),
        document.getElementById(f.senha).value,
        f.btn,
        f.erro
    );
}

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
});
