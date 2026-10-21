const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const loginTab = document.querySelector('#login-tab');
const registerTab = document.querySelector('#register-tab');
const submitButton = document.querySelector('#top-submit');
const message = document.querySelector('#form-message');
let activeForm = 'login';

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.remove('hidden', 'border-rose-200', 'bg-rose-50', 'text-rose-700', 'border-emerald-200', 'bg-emerald-50', 'text-emerald-700');
  message.classList.add(...(success
    ? ['border-emerald-200', 'bg-emerald-50', 'text-emerald-700']
    : ['border-rose-200', 'bg-rose-50', 'text-rose-700']));
}

if (new URLSearchParams(window.location.search).get('error') === 'session') {
  showMessage('Tu sesión expiró. Inicia sesión nuevamente.');
}

function setMode(mode) {
  activeForm = mode;
  const registering = mode === 'register';
  loginForm.classList.toggle('hidden', registering);
  registerForm.classList.toggle('hidden', !registering);
  loginTab.setAttribute('aria-selected', String(!registering));
  registerTab.setAttribute('aria-selected', String(registering));
  loginTab.className = registering
    ? 'rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-pink-700'
    : 'rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-pink-700 shadow-sm';
  registerTab.className = registering
    ? 'rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-pink-700 shadow-sm'
    : 'rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-pink-700';
  document.querySelector('#form-title').textContent = registering ? 'Crear cuenta' : 'Inicia sesión';
  document.querySelector('#form-description').textContent = registering
    ? 'Registra tu correo y crea una contraseña para tu cuenta.'
    : 'Ingresa tu correo electrónico y contraseña para continuar.';
  submitButton.textContent = registering ? 'Crear cuenta' : 'Iniciar sesión';
  message.classList.add('hidden');
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => {
  setMode('login');
  showMessage('El administrador crea las cuentas y asigna los roles desde el módulo Usuarios.');
});
submitButton.addEventListener('click', () => {
  (activeForm === 'register' ? registerForm : loginForm).requestSubmit();
});

async function sendAuthRequest(mode, form) {
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '');

  if (!form.reportValidity()) return;
  if (mode === 'register' && password !== data.get('confirmPassword')) {
    showMessage('Las contraseñas no coinciden.');
    return;
  }

  const endpoint = mode === 'register' ? 'auth/register' : 'auth/login';
  const savedApiBase = (localStorage.getItem('inventariopro_api_url') || '').replace(/\/$/, '');
  const siteOrigin = window.location.origin.replace(/\/$/, '');
  const apiBases = savedApiBase ? [savedApiBase] : [
    siteOrigin,
    `${siteOrigin}/api/public`,
    `${siteOrigin}/api`,
    new URL('../api/public', window.location.href).href.replace(/\/$/, '')
  ];
  if (!savedApiBase && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    apiBases.push(`http://${window.location.hostname}/api/public`);
    apiBases.push(`http://${window.location.hostname}:8000`);
  }
  const candidates = [...new Set(apiBases)];
  const buttons = [...document.querySelectorAll('button[type="submit"], #top-submit')];
  buttons.forEach(button => { button.disabled = true; });
  message.classList.add('hidden');

  try {
    let response;
    let result;
    const failures = [];
    for (const apiBase of candidates) {
      const url = apiBase.endsWith('/index.php')
        ? `${apiBase}?route=${encodeURIComponent(endpoint)}`
        : `${apiBase}/${endpoint}`;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username: email, password })
        });
      } catch {
        failures.push(url);
        continue;
      }

      result = await response.json().catch(() => null);
      if (response.status === 404 || response.status === 405) {
        failures.push(url);
        continue;
      }
      if (response.ok || response.status !== 404) {
        if (!savedApiBase) localStorage.setItem('inventariopro_api_url', apiBase);
        break;
      }
    }

    if (!response || failures.length === candidates.length) {
      throw new Error(`No se encontró la API de autenticación. Rutas probadas: ${failures.join(' · ')}`);
    }
    if (!response.ok) throw new Error(result?.message || (mode === 'login'
      ? 'No se pudo iniciar sesión. Revisa tus credenciales.'
      : 'No se pudo crear la cuenta.'));

    if (result?.token) sessionStorage.setItem('inventariopro_session_token', result.token);
    if (result?.user) sessionStorage.setItem('inventariopro_user', JSON.stringify(result.user));
    if (mode === 'login' || result?.token) {
      window.location.assign('./dashboard.html');
      return;
    }

    loginForm.elements.email.value = email;
    loginForm.elements.password.value = '';
    setMode('login');
    showMessage('Cuenta creada. Ya puedes iniciar sesión.', true);
  } catch (error) {
    showMessage(error.message || 'No se pudo conectar con el servidor.');
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  sendAuthRequest('login', loginForm);
});
registerForm.addEventListener('submit', event => {
  event.preventDefault();
  sendAuthRequest('register', registerForm);
});
