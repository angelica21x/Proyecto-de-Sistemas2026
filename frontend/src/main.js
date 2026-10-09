import { apiRequest, defaultApiUrl, getApiUrl, setApiUrl } from './utils/api.js?v=8';

const app = document.getElementById('app');
const pageTitle = document.getElementById('page-title');
const navLinks = [...document.querySelectorAll('[data-view]')];
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');
const state = { view: 'dashboard', rows: [], related: {}, search: '' };

const modules = {
  productos: {
    title: 'Productos', endpoint: 'productos', subtitle: 'Controla existencias, costos y ubicación de cada producto.',
    fields: [
      ['codbarras', 'Código de barras', 'text'], ['nombre', 'Nombre', 'text'], ['descripcion', 'Descripción', 'text'],
      ['stock_actual', 'Stock actual', 'number'], ['stock_minimo', 'Stock mínimo', 'number'], ['precio_costo', 'Precio de costo', 'number'],
      ['cod_categoria', 'Categoría', 'relation:categorias'], ['cod_ubicacion', 'Ubicación', 'relation:ubicaciones']
    ], required: ['codbarras', 'nombre', 'descripcion', 'stock_actual', 'stock_minimo', 'precio_costo', 'cod_categoria', 'cod_ubicacion'],
    columns: ['id', 'codbarras', 'nombre', 'stock_actual', 'stock_minimo', 'precio_costo', 'cod_categoria', 'cod_ubicacion'],
    labels: { id: 'ID', codbarras: 'Código', nombre: 'Producto', stock_actual: 'Stock', stock_minimo: 'Mínimo', precio_costo: 'Costo', cod_categoria: 'Categoría', cod_ubicacion: 'Ubicación' },
    relations: { cod_categoria: ['categorias', 'nombre'], cod_ubicacion: ['ubicaciones', 'zona_sector'] }
  },
  categorias: {
    title: 'Categorías', endpoint: 'categorias', subtitle: 'Organiza los productos por categoría.',
    fields: [['nombre', 'Nombre', 'text'], ['descripcion', 'Descripción', 'textarea']], required: ['nombre'],
    columns: ['id', 'nombre', 'descripcion'], labels: { id: 'ID', nombre: 'Categoría', descripcion: 'Descripción' }
  },
  empleados: {
    title: 'Empleados', endpoint: 'empleados', subtitle: 'Administra a las personas responsables del almacén.',
    fields: [['ci', 'Cédula / CI', 'text'], ['nombre', 'Nombre', 'text'], ['apellidos', 'Apellidos', 'text'], ['cargo', 'Cargo', 'text']],
    required: ['ci', 'nombre', 'apellidos', 'cargo'], columns: ['id', 'ci', 'nombre', 'apellidos', 'cargo'],
    labels: { id: 'ID', ci: 'CI', nombre: 'Nombre', apellidos: 'Apellidos', cargo: 'Cargo' }
  },
  proveedores: {
    title: 'Proveedores', endpoint: 'proveedores', subtitle: 'Mantén actualizados los datos de contacto de tus proveedores.',
    fields: [['nit_rut', 'NIT / RUT', 'text'], ['razon_social', 'Razón social', 'text'], ['contacto_nombre', 'Persona de contacto', 'text', false], ['direccion', 'Dirección', 'text', false], ['telefono', 'Teléfono', 'tel', false], ['email', 'Correo electrónico', 'email', false]],
    required: ['nit_rut', 'razon_social'], columns: ['id', 'nit_rut', 'razon_social', 'contacto_nombre', 'telefono', 'email'],
    labels: { id: 'ID', nit_rut: 'NIT / RUT', razon_social: 'Razón social', contacto_nombre: 'Contacto', telefono: 'Teléfono', email: 'Correo' }
  },
  ubicaciones: {
    title: 'Ubicaciones', endpoint: 'ubicaciones', subtitle: 'Define sectores, pasillos y estantes del almacén.',
    fields: [['zona_sector', 'Zona / sector', 'text'], ['pasillo', 'Pasillo', 'text'], ['estante', 'Estante', 'text'], ['nivel_balda', 'Nivel / balda', 'text']],
    required: ['zona_sector', 'pasillo', 'estante', 'nivel_balda'], columns: ['id', 'zona_sector', 'pasillo', 'estante', 'nivel_balda'],
    labels: { id: 'ID', zona_sector: 'Zona / sector', pasillo: 'Pasillo', estante: 'Estante', nivel_balda: 'Nivel / balda' }
  },
  movimientos: {
    title: 'Movimientos', endpoint: 'movimientos', subtitle: 'Registra entradas, salidas y ajustes de inventario.',
    fields: [['tipo_movimiento', 'Tipo', 'select:ENTRADA|SALIDA|AJUSTE'], ['fecha_registro', 'Fecha y hora', 'datetime-local', false], ['documento_referencia', 'Documento de referencia', 'text', false], ['observaciones', 'Observaciones', 'textarea', false], ['cod_empleado', 'Empleado responsable', 'relation:empleados'], ['cod_proveedor', 'Proveedor', 'relation:proveedores', false]],
    required: ['tipo_movimiento', 'cod_empleado'], columns: ['id', 'tipo_movimiento', 'fecha_registro', 'documento_referencia', 'cod_empleado', 'cod_proveedor'],
    labels: { id: 'ID', tipo_movimiento: 'Tipo', fecha_registro: 'Fecha', documento_referencia: 'Documento', cod_empleado: 'Empleado', cod_proveedor: 'Proveedor' },
    relations: { cod_empleado: ['empleados', 'nombre', 'apellidos'], cod_proveedor: ['proveedores', 'razon_social'] }
  },
  detalle_movimientos: {
    title: 'Detalle de movimientos', endpoint: 'detalle_movimientos', subtitle: 'Consulta y edita los productos y cantidades asociados a cada movimiento.',
    fields: [['cod_movimiento', 'Movimiento', 'relation:movimientos'], ['cod_producto', 'Producto', 'relation:productos'], ['cantidad', 'Cantidad', 'number'], ['precio_historico', 'Precio histórico', 'number']],
    required: ['cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'], columns: ['id', 'cod_movimiento', 'cod_producto', 'cantidad', 'precio_historico'],
    labels: { id: 'ID', cod_movimiento: 'Movimiento', cod_producto: 'Producto', cantidad: 'Cantidad', precio_historico: 'Precio histórico' },
    relations: { cod_movimiento: ['movimientos', 'tipo_movimiento'], cod_producto: ['productos', 'nombre'] }
  },
  usuarios: {
    title: 'Usuarios', endpoint: 'usuarios', subtitle: 'Administra las cuentas y roles de acceso al sistema.',
    fields: [['username', 'Nombre de usuario', 'text'], ['password', 'Contraseña', 'password'], ['rol', 'Rol', 'select:ADMINISTRADOR|ALMACENERO|SUPERVISOR'], ['estado', 'Estado', 'select:1|0'], ['cod_empleado', 'Empleado asociado', 'relation:empleados']],
    required: ['username', 'rol', 'cod_empleado'], columns: ['id', 'username', 'rol', 'estado', 'cod_empleado'],
    labels: { id: 'ID', username: 'Usuario', rol: 'Rol', estado: 'Estado', cod_empleado: 'Empleado' },
    relations: { cod_empleado: ['empleados', 'nombre', 'apellidos'] }
  }
};

const relationEndpoints = {
  categorias: 'categorias', ubicaciones: 'ubicaciones', empleados: 'empleados', proveedores: 'proveedores',
  productos: 'productos', movimientos: 'movimientos'
};

function invalidateRelationCache(endpoint) {
  Object.entries(relationEndpoints).forEach(([key, value]) => {
    if (value === endpoint) delete state.related[key];
  });
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fieldLabels = Object.fromEntries(Object.values(modules).flatMap(module => module.fields.map(([name, label]) => [name, label])));
const formatDate = value => {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

function toast(message, error = false) {
  const item = document.createElement('div');
  item.className = `toast${error ? ' error' : ''}`;
  item.textContent = message;
  toastRoot.append(item);
  window.setTimeout(() => item.remove(), 4200);
}

function setConnection(online, label) {
  document.querySelector('.status-dot').classList.toggle('online', online);
  document.getElementById('connection-label').textContent = label;
}

function setActiveNavigation(view) {
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === view));
  document.getElementById('sidebar').classList.remove('open');
}

function renderLoading(message = 'Cargando información…') {
  app.innerHTML = `<div class="table-card loading-state">${escapeHtml(message)}</div>`;
}

function renderError(error, retryView = state.view) {
  setConnection(false, 'Sin conexión');
  app.innerHTML = `<div class="notice error">${escapeHtml(error.message || error)}</div><div class="card"><h3>No se pudo cargar la información</h3><p class="card-subtitle">Revisa la URL de la API, Apache/PHP y la conexión a la base de datos.</p><button class="button" data-action="retry" data-view="${escapeHtml(retryView)}">Reintentar</button> <a class="button secondary" href="#configuracion" data-view="configuracion">Configurar API</a></div>`;
}

function apiNotice() {
  if (location.protocol === 'file:') return '<div class="notice">Abre el proyecto con un servidor local para que JavaScript y la API funcionen correctamente.</div>';
  return '';
}

function getRelatedMap(config) {
  const result = {};
  for (const [field, [relationKey, first, second]] of Object.entries(config.relations || {})) {
    const rows = state.related[relationKey] || [];
    result[field] = Object.fromEntries(rows.map(row => [String(row.id), [row[first], second ? row[second] : null].filter(Boolean).join(' ')]));
  }
  return result;
}

function displayCell(config, key, value) {
  if (value === null || value === undefined || value === '') return '<span class="muted">—</span>';
  const relationValue = getRelatedMap(config)[key]?.[String(value)];
  const display = relationValue || (key.includes('fecha') ? formatDate(value) : value);
  if (key === 'tipo_movimiento') {
    const cls = value === 'ENTRADA' ? 'green' : value === 'SALIDA' ? 'orange' : '';
    return `<span class="tag ${cls}">${escapeHtml(display)}</span>`;
  }
  if (key === 'estado') return `<span class="tag ${String(value) === '1' ? 'green' : 'orange'}">${String(value) === '1' ? 'Activo' : 'Inactivo'}</span>`;
  if (key === 'password_hash') return '<span class="muted">Protegida</span>';
  return escapeHtml(display);
}

function renderModule(view, rows, notice = '') {
  const config = modules[view];
  const filtered = rows.filter(row => {
    if (view === 'entradas' && row.tipo_movimiento !== 'ENTRADA') return false;
    if (view === 'salidas' && row.tipo_movimiento !== 'SALIDA') return false;
    const needle = state.search.trim().toLocaleLowerCase('es');
    return !needle || Object.values(row).some(value => String(value ?? '').toLocaleLowerCase('es').includes(needle));
  });
  const headers = config.columns.map(key => `<th>${escapeHtml(config.labels[key] || fieldLabels[key] || key)}</th>`).join('');
  const body = filtered.map(row => `<tr>${config.columns.map(key => `<td>${displayCell(config, key, row[key])}</td>`).join('')}<td><div class="actions"><button class="button secondary small" data-action="edit" data-id="${escapeHtml(row.id)}">Editar</button><button class="button danger small" data-action="delete" data-id="${escapeHtml(row.id)}">Eliminar</button></div></td></tr>`).join('');
  app.innerHTML = `${notice}<div class="page-heading"><div><h2>${escapeHtml(config.title)}</h2><p>${escapeHtml(config.subtitle)}</p></div><button class="button" data-action="create">＋ Nuevo registro</button></div><div class="toolbar"><input class="search-input" id="table-search" type="search" placeholder="Buscar en ${escapeHtml(config.title.toLowerCase())}…" value="${escapeHtml(state.search)}"><button class="button secondary" data-action="export">Exportar CSV</button><button class="button secondary" data-action="refresh">Actualizar</button></div><div class="table-card"><div class="table-scroll"><table><thead><tr>${headers}<th>Acciones</th></tr></thead><tbody>${body || `<tr><td colspan="${config.columns.length + 1}" class="empty-state">${state.search ? 'No hay coincidencias.' : 'Todavía no hay registros.'}</td></tr>`}</tbody></table></div></div><p class="muted" style="font-size:11px;margin:10px 2px">${filtered.length} registro${filtered.length === 1 ? '' : 's'}</p>`;
}

async function loadRelations(config) {
  const requests = Object.keys(config.relations || {}).map(async field => {
    const [key, endpoint] = [config.relations[field][0], relationEndpoints[config.relations[field][0]]];
    if (state.related[key]) return;
    const rows = await apiRequest(endpoint);
    if (!Array.isArray(rows)) throw new Error(`La API no devolvió una lista de ${key}.`);
    state.related[key] = rows;
  });
  await Promise.all(requests);
}

async function loadModule(view, keepSearch = false) {
  state.view = view;
  if (!keepSearch) state.search = '';
  pageTitle.textContent = modules[view].title;
  setActiveNavigation(view);
  renderLoading();
  try {
    const [rows] = await Promise.all([apiRequest(modules[view].endpoint), loadRelations(modules[view])]);
    if (!Array.isArray(rows)) throw new Error('La API no devolvió una lista. Revisa el endpoint.');
    state.rows = rows;
    setConnection(true, 'Conectada');
    renderModule(view, rows, apiNotice());
  } catch (error) {
    renderError(error, view);
  }
}

function statCard(label, value, note) {
  return `<article class="stat-card"><div class="stat-label">${escapeHtml(label)}</div><div class="stat-value">${escapeHtml(value)}</div><div class="stat-note">${escapeHtml(note)}</div></article>`;
}

async function loadDashboard() {
  state.view = 'dashboard';
  state.search = '';
  pageTitle.textContent = 'Dashboard';
  setActiveNavigation('dashboard');
  renderLoading('Cargando resumen del inventario…');
  try {
    const [products, movements, categories, employees] = await Promise.all([
      apiRequest('productos'), apiRequest('movimientos'), apiRequest('categorias'), apiRequest('empleados')
    ]);
    if (![products, movements, categories, employees].every(Array.isArray)) throw new Error('La API devolvió un formato inesperado.');
    setConnection(true, 'Conectada');
    const stock = products.reduce((total, product) => total + Number(product.stock_actual || 0), 0);
    const lowStock = products.filter(product => Number(product.stock_actual || 0) <= Number(product.stock_minimo || 0));
    const entries = movements.filter(item => item.tipo_movimiento === 'ENTRADA').length;
    const exits = movements.filter(item => item.tipo_movimiento === 'SALIDA').length;
    const recent = [...movements].sort((a, b) => String(b.fecha_registro || '').localeCompare(String(a.fecha_registro || ''))).slice(0, 5);
    const rows = recent.map(item => `<tr><td>${escapeHtml(formatDate(item.fecha_registro))}</td><td><span class="tag ${item.tipo_movimiento === 'ENTRADA' ? 'green' : item.tipo_movimiento === 'SALIDA' ? 'orange' : ''}">${escapeHtml(item.tipo_movimiento)}</span></td><td>${escapeHtml(item.documento_referencia || '—')}</td><td>${escapeHtml(item.observaciones || '—')}</td></tr>`).join('');
    app.innerHTML = `${apiNotice()}<div class="page-heading"><div><h2>Resumen del almacén</h2><p>Indicadores basados en los datos actuales de la API.</p></div><button class="button secondary" data-action="refresh">Actualizar datos</button></div><div class="stats-grid">${statCard('Productos registrados', products.length, 'Productos en catálogo')}${statCard('Unidades en stock', stock, 'Suma de existencias actuales')}${statCard('Productos con stock bajo', lowStock.length, 'Igual o menor al mínimo')}${statCard('Movimientos', movements.length, `${entries} entradas · ${exits} salidas`)}</div><div class="dashboard-grid"><section class="card"><h3>Movimientos recientes</h3><p class="card-subtitle">Últimos movimientos registrados</p><div class="table-scroll"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Documento</th><th>Observaciones</th></tr></thead><tbody>${rows || `<tr><td colspan="4" class="empty-state">No hay movimientos registrados.</td></tr>`}</tbody></table></div></section><section class="card"><h3>Accesos rápidos</h3><p class="card-subtitle">Ir directamente a un módulo</p><div class="quick-grid"><a class="quick-link" href="#productos" data-view="productos">＋ Productos</a><a class="quick-link" href="#movimientos" data-view="movimientos">＋ Movimientos</a><a class="quick-link" href="#categorias" data-view="categorias">Categorías · ${categories.length}</a><a class="quick-link" href="#empleados" data-view="empleados">Empleados · ${employees.length}</a><a class="quick-link" href="#reportes" data-view="reportes">Ver reportes</a><a class="quick-link" href="#configuracion" data-view="configuracion">Configurar API</a></div></section></div>${lowStock.length ? `<section class="card" style="margin-top:16px"><h3>Requieren reposición</h3><p class="card-subtitle">Productos en o debajo de su stock mínimo</p><div class="stock-list">${lowStock.slice(0, 8).map(product => `<div class="stock-item"><span>${escapeHtml(product.nombre)}</span><span>${escapeHtml(product.stock_actual)} / mínimo ${escapeHtml(product.stock_minimo)}</span></div>`).join('')}</div></section>` : ''}`;
  } catch (error) {
    renderError(error, 'dashboard');
  }
}

async function loadReports() {
  state.view = 'reportes';
  pageTitle.textContent = 'Reportes';
  setActiveNavigation('reportes');
  renderLoading('Preparando reportes…');
  try {
    const [products, movements] = await Promise.all([apiRequest('productos'), apiRequest('movimientos')]);
    const typeCounts = ['ENTRADA', 'SALIDA', 'AJUSTE'].map(type => [type, movements.filter(item => item.tipo_movimiento === type).length]);
    const totalValue = products.reduce((sum, item) => sum + Number(item.stock_actual || 0) * Number(item.precio_costo || 0), 0);
    const low = products.filter(item => Number(item.stock_actual || 0) <= Number(item.stock_minimo || 0));
    setConnection(true, 'Conectada');
    app.innerHTML = `${apiNotice()}<div class="page-heading"><div><h2>Reportes del inventario</h2><p>Resumen calculado a partir de productos y movimientos registrados.</p></div><button class="button secondary" data-action="refresh">Actualizar</button></div><div class="stats-grid">${statCard('Valor estimado del stock', totalValue.toFixed(2), 'Stock actual × precio de costo')}${statCard('Productos bajo mínimo', low.length, 'Revisar para reposición')}${statCard('Total de movimientos', movements.length, 'Todos los tipos')}${statCard('Productos activos', products.length, 'Registros en catálogo')}</div><div class="dashboard-grid"><section class="card"><h3>Movimientos por tipo</h3><p class="card-subtitle">Cantidad de registros por operación</p>${typeCounts.map(([type, count]) => `<div class="report-row"><span>${escapeHtml(type)}</span><strong>${count}</strong></div>`).join('')}</section><section class="card"><h3>Stock bajo</h3><p class="card-subtitle">Productos que necesitan atención</p>${low.length ? low.slice(0, 12).map(item => `<div class="report-row"><span>${escapeHtml(item.nombre)}</span><strong>${escapeHtml(item.stock_actual)} / ${escapeHtml(item.stock_minimo)}</strong></div>`).join('') : '<p class="muted">No hay productos bajo mínimo.</p>'}</section></div>`;
  } catch (error) { renderError(error, 'reportes'); }
}

function loadSettings() {
  state.view = 'configuracion';
  pageTitle.textContent = 'Configuración';
  setActiveNavigation('configuracion');
  const currentUrl = getApiUrl();
  app.innerHTML = `<div class="page-heading"><div><h2>Conexión con la API</h2><p>Indica la dirección base donde está publicado PHP. No incluyas el nombre de un endpoint al final.</p></div></div><section class="card"><div class="config-row"><div class="field"><label for="api-url">URL base de la API</label><input id="api-url" type="url" value="${escapeHtml(currentUrl)}" placeholder="http://localhost/Proyecto-de-Sistemas2026/api/public"></div><button class="button" data-action="save-api">Guardar y probar</button><button class="button secondary" data-action="default-api">Usar ruta relativa</button></div><p id="api-status" class="status-box">URL guardada: ${escapeHtml(currentUrl)}</p></section><section class="card" style="margin-top:16px"><h3>Cómo conectarlo en local</h3><p class="card-subtitle">Inicia Apache y MySQL en WAMP/XAMPP, importa el SQL del proyecto y abre el frontend desde el mismo servidor web. Si usas Live Server, guarda aquí la URL de la API servida por Apache.</p><div class="report-row"><span>Ruta sugerida del frontend</span><strong class="muted">http://localhost/Proyecto-de-Sistemas2026/frontend/</strong></div><div class="report-row"><span>Ruta sugerida de la API</span><strong class="muted">http://localhost/Proyecto-de-Sistemas2026/api/public</strong></div><div class="report-row"><span>Endpoint para comprobar conexión</span><strong class="muted">/productos</strong></div></section>`;
}

function renderFormField(field, record = {}, isEditing = false) {
  const [name, label, kind, optional] = field;
  const required = (modules[state.view].required.includes(name) || (name === 'password' && !isEditing)) && !(name === 'password' && isEditing);
  let control;
  if (kind.startsWith('relation:')) {
    const relationKey = kind.split(':')[1];
    let data = state.related[relationKey] || [];
    if (state.view === 'usuarios' && name === 'cod_empleado') {
      const assignedEmployees = new Set(state.rows
        .filter(user => !isEditing || String(user.id) !== String(record.id))
        .map(user => String(user.cod_empleado)));
      data = data.filter(employee => !assignedEmployees.has(String(employee.id)) || String(employee.id) === String(record.cod_empleado));
    }
    const relationLabel = row => {
      if (relationKey === 'categorias') return row.nombre;
      if (relationKey === 'ubicaciones') return `${row.zona_sector} · ${row.pasillo} · ${row.estante}`;
      if (relationKey === 'empleados') return `${row.nombre} ${row.apellidos || ''}`.trim();
      if (relationKey === 'proveedores') return row.razon_social;
      if (relationKey === 'productos') return row.nombre;
      if (relationKey === 'movimientos') return `${row.tipo_movimiento} #${row.id}`;
      return row.id;
    };
    control = `<select id="field-${name}" name="${name}" ${required ? 'required' : ''}><option value="">${optional ? 'Sin seleccionar' : 'Selecciona una opción'}</option>${data.map(row => `<option value="${escapeHtml(row.id)}" ${String(record[name] ?? '') === String(row.id) ? 'selected' : ''}>${escapeHtml(relationLabel(row))}</option>`).join('')}</select>`;
  } else if (kind.startsWith('select:')) {
    const options = kind.slice(7).split('|');
    control = `<select id="field-${name}" name="${name}" ${required ? 'required' : ''}><option value="">Selecciona una opción</option>${options.map(value => `<option value="${escapeHtml(value)}" ${String(record[name] ?? '') === value ? 'selected' : ''}>${escapeHtml(name === 'estado' ? (value === '1' ? 'Activo' : 'Inactivo') : value)}</option>`).join('')}</select>`;
  } else if (kind === 'textarea') {
    control = `<textarea id="field-${name}" name="${name}" ${required ? 'required' : ''}>${escapeHtml(record[name] ?? '')}</textarea>`;
  } else {
    let value = record[name] ?? '';
    if (kind === 'datetime-local' && value) value = String(value).replace(' ', 'T').slice(0, 16);
    const isPassword = kind === 'password';
    control = `<input id="field-${name}" name="${name}" type="${kind}" value="${isPassword ? '' : escapeHtml(value)}" ${kind === 'number' ? 'step="any"' : ''} ${required ? 'required' : ''} ${isPassword && isEditing ? 'autocomplete="new-password" placeholder="Dejar vacío para conservar la contraseña actual"' : ''}>`;
  }
  const hint = name === 'password' && isEditing ? '<small class="muted">Solo completa este campo si deseas cambiar la contraseña.</small>' : '';
  return `<div class="field ${kind === 'textarea' ? 'full' : ''}"><label for="field-${name}">${escapeHtml(label)}${required ? ' *' : ''}</label>${control}${hint}</div>`;
}

async function openForm(id = null, defaults = {}) {
  const config = modules[state.view];
  const isEditing = id !== null;
  const record = isEditing ? state.rows.find(row => String(row.id) === String(id)) : defaults;
  if (!record && isEditing) return toast('No encontré ese registro. Actualiza la lista e intenta otra vez.', true);
  try { await loadRelations(config); }
  catch (error) { return toast(`No pude cargar las opciones del formulario: ${error.message}`, true); }
  if (state.view === 'usuarios' && !isEditing) {
    const assignedEmployees = new Set(state.rows.map(user => String(user.cod_empleado)));
    const availableEmployees = (state.related.empleados || []).filter(employee => !assignedEmployees.has(String(employee.id)));
    if (!availableEmployees.length) {
      return toast('No hay empleados sin usuario. Primero registra un empleado nuevo o libera la cuenta de un empleado existente.', true);
    }
  }
  const fieldsHtml = config.fields.filter(field => !isEditing || field[0] !== 'password_hash').map(field => renderFormField(field, record || {}, isEditing)).join('');
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">${isEditing ? 'Editar' : 'Nuevo'} ${escapeHtml(config.title.toLowerCase().replace(/s$/, ''))}</h2><p>${isEditing ? `Registro #${escapeHtml(id)}` : 'Completa los campos para guardar el registro.'}</p></div><button type="button" class="button secondary small" data-action="close-modal" aria-label="Cerrar">✕</button></div><form id="record-form"><div class="form-grid">${fieldsHtml}</div><div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">Cancelar</button><button class="button" type="submit">${isEditing ? 'Guardar cambios' : 'Crear registro'}</button></div></form></section></div>`;
  modalRoot.querySelectorAll('[data-action="close-modal"]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      modalRoot.innerHTML = '';
    });
  });
  modalRoot.querySelector('#record-form').addEventListener('submit', event => saveRecord(event, id));
  modalRoot.querySelector('input, select, textarea')?.focus();
}

async function saveRecord(event, id) {
  event.preventDefault();
  const form = event.currentTarget;
  const config = modules[state.view];
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando…';
  const data = {};
  for (const field of config.fields) {
    const [name, , kind] = field;
    const control = form.elements.namedItem(name);
    if (!control) continue;
    let value = control.value.trim();
    if (name === 'password' && !value && id !== null) continue;
    if (kind === 'number' || (kind.startsWith('select:') && ['estado'].includes(name)) || kind.startsWith('relation:')) value = value === '' ? null : Number(value);
    if (kind === 'datetime-local' && value) value = value.replace('T', ' ') + (value.length === 16 ? ':00' : '');
    if (value === '' && field[3] === false) {
      if (name === 'fecha_registro') continue;
      value = null;
    }
    data[name] = value;
  }
  try {
    await apiRequest(id === null ? config.endpoint : `${config.endpoint}/${id}`, { method: id === null ? 'POST' : 'PUT', body: data });
    invalidateRelationCache(config.endpoint);
    modalRoot.innerHTML = '';
    toast(id === null ? 'Registro creado correctamente.' : 'Cambios guardados correctamente.');
    await loadCurrentView();
  } catch (error) {
    toast(error.message, true);
    submit.disabled = false;
    submit.textContent = id === null ? 'Crear registro' : 'Guardar cambios';
  }
}

async function deleteRecord(id) {
  const config = modules[state.view];
  if (!window.confirm(`¿Eliminar el registro #${id}? Esta acción no se puede deshacer.`)) return;
  try {
    await apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
    invalidateRelationCache(config.endpoint);
    toast('Registro eliminado correctamente.');
    await loadCurrentView();
  } catch (error) { toast(error.message, true); }
}

function exportCsv() {
  const config = modules[state.view];
  const rows = state.rows.filter(row => {
    if (state.view === 'entradas' && row.tipo_movimiento !== 'ENTRADA') return false;
    if (state.view === 'salidas' && row.tipo_movimiento !== 'SALIDA') return false;
    return true;
  });
  const csv = [config.columns.map(key => `"${(config.labels[key] || key).replaceAll('"', '""')}"`).join(','), ...rows.map(row => config.columns.map(key => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.view}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function loadCurrentView() {
  const view = location.hash.slice(1) || 'dashboard';
  if (modules[view]) return loadModule(view, true);
  if (view === 'entradas' || view === 'salidas') {
    modules[view] = { ...modules.movimientos, title: view === 'entradas' ? 'Entradas' : 'Salidas', subtitle: view === 'entradas' ? 'Movimientos de ingreso al almacén.' : 'Movimientos de salida del almacén.' };
    return loadModule(view, true);
  }
  if (view === 'dashboard') return loadDashboard();
  if (view === 'reportes') return loadReports();
  if (view === 'configuracion') return loadSettings();
  location.hash = 'dashboard';
}

app.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'create') {
    const defaults = state.view === 'entradas' ? { tipo_movimiento: 'ENTRADA' } : state.view === 'salidas' ? { tipo_movimiento: 'SALIDA' } : {};
    return openForm(null, defaults);
  }
  if (action === 'edit') return openForm(button.dataset.id);
  if (action === 'delete') return deleteRecord(button.dataset.id);
  if (action === 'refresh' || action === 'retry') return action === 'retry' && button.dataset.view !== location.hash.slice(1) ? (location.hash = button.dataset.view) : loadCurrentView();
  if (action === 'export') return exportCsv();
  if (action === 'save-api') {
    const status = document.getElementById('api-status');
    try {
      const url = setApiUrl(document.getElementById('api-url').value);
      status.textContent = `Probando conexión con ${url}…`;
      const products = await apiRequest('productos');
      if (!Array.isArray(products)) throw new Error('La API respondió, pero no pudo consultar productos. Revisa la base de datos.');
      status.textContent = 'Conexión correcta. La API de productos respondió.';
      setConnection(true, 'Conectada');
      toast('Conexión con la API establecida.');
    } catch (error) { status.textContent = error.message; setConnection(false, 'Sin conexión'); }
  }
  if (action === 'default-api') {
    document.getElementById('api-url').value = defaultApiUrl();
    try { localStorage.removeItem('inventariopro_api_url'); } catch { /* local storage may be unavailable */ }
    toast('Se usará la ruta relativa del proyecto.');
  }
});

app.addEventListener('input', event => {
  if (event.target.id === 'table-search') {
    state.search = event.target.value;
    renderModule(state.view, state.rows, apiNotice());
    const search = document.getElementById('table-search');
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }
});

document.body.addEventListener('click', event => {
  const link = event.target.closest('[data-view]');
  if (link) {
    const view = link.dataset.view;
    if (location.hash.slice(1) === view) {
      event.preventDefault();
      loadCurrentView();
    }
  }
});

document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('today-label').textContent = new Intl.DateTimeFormat('es-BO', { dateStyle: 'full' }).format(new Date());
window.addEventListener('hashchange', loadCurrentView);
loadCurrentView();
