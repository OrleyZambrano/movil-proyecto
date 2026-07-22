import { Platform } from 'react-native';
import { leerToken } from './storage';

const API_URL = 'http://10.136.23.84:8000/api';
const API_BASE = 'http://10.136.23.84:8000';
const API_TIMEOUT = 15000;

// En web usamos el fetch nativo del navegador para que un Blob dentro de un
// FormData se serialice correctamente. El fetch/FormData polyfill de React
// Native no soporta Blobs y lanza "Unsupported FormDataPart implementation".
export const API_BASE_URL = API_BASE;

const nativeFetch =
  Platform.OS === 'web' && typeof window !== 'undefined' && window.fetch
    ? window.fetch.bind(window)
    : fetch;

async function request(endpoint, options = {}) {
  const token = await leerToken();
  const headers = { Accept: 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isFormData = options.body && typeof options.body.append === 'function';
  if (options.body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await nativeFetch(`${API_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la solicitud');
    return data;
  } catch (e) {
    clearTimeout(timeout);
    const msg = e?.message || '';
    if (e.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Verifica tu conexión.');
    if (msg.includes('Network request failed') || msg.includes('No route to host') || msg.includes('Host unreachable') || msg.includes('Unable to connect') || msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENETUNREACH') || msg.includes('ERR_CONNECTION'))
      throw new Error('No se puede conectar con el servidor. Verifica tu conexión a internet.');
    throw e;
  }
}

export const login = (email, password) =>
  request('/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name, email, password, confirmation, telefono) =>
  request('/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation: confirmation, telefono }) });

export const logout = () => request('/logout', { method: 'POST' });
export const getUser = () => request('/user');

export const getReportes = (params) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/reportes${q}`);
};
export const getReporte = (id) => request(`/reportes/${id}`);
export const createReporte = (payload) => request('/reportes', { method: 'POST', body: JSON.stringify(payload) });
export const updateReporte = (id, payload) => request(`/reportes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteReporte = (id) => request(`/reportes/${id}`, { method: 'DELETE' });
export const updateEstado = (id, estado) => request(`/reportes/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
export const getMisReportes = () => request('/mis-reportes');

export const getCategorias = () => request('/categorias');

export const getComentarios = (reporteId) => request(`/reportes/${reporteId}/comentarios`);
export const createComentario = (reporteId, comentario) =>
  request(`/reportes/${reporteId}/comentarios`, { method: 'POST', body: JSON.stringify({ comentario }) });

export const getNotificaciones = () => request('/notificaciones');
export const marcarNotificacionLeida = (id) => request(`/notificaciones/${id}/leida`, { method: 'PATCH' });
export const marcarTodasLeidas = () => request('/notificaciones/leer-todas', { method: 'PATCH' });
export const eliminarNotificacion = (id) => request(`/notificaciones/${id}`, { method: 'DELETE' });

export const getEstadisticas = () => request('/estadisticas');

// Categorías (solo admin)
export const crearCategoria = (nombre, icono, color) =>
  request('/categorias', { method: 'POST', body: JSON.stringify({ nombre, icono, color }) });

export const actualizarCategoria = (id, datos) =>
  request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(datos) });

export const eliminarCategoria = (id) =>
  request(`/categorias/${id}`, { method: 'DELETE' });

// Usuarios (admin)
export const getUsuarios = (params) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/usuarios${q}`);
};
export const getFuncionarios = () => request('/funcionarios');
export const crearUsuario = (datos) =>
  request('/usuarios', { method: 'POST', body: JSON.stringify(datos) });
export const actualizarUsuario = (id, datos) =>
  request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarUsuario = (id) =>
  request(`/usuarios/${id}`, { method: 'DELETE' });

// Asignación de reporte a funcionario (admin)
export const asignarReporte = (id, funcionarioId) =>
  request(`/reportes/${id}/asignar`, { method: 'POST', body: JSON.stringify({ funcionario_id: funcionarioId }) });

// Reportes cercanos
export const getReportesCercanos = (lat, lng, radio = 5) =>
  request(`/reportes/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`);

// Avisos
export const getAvisos = (params) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/avisos${q}`);
};
export const getAviso = (id) => request(`/avisos/${id}`);
export const createAviso = (payload) =>
  request('/avisos', { method: 'POST', body: JSON.stringify(payload) });
export const updateAviso = (id, payload) =>
  request(`/avisos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteAviso = (id) => request(`/avisos/${id}`, { method: 'DELETE' });
export const getAvisosCercanos = (lat, lng, radio = 5) =>
  request(`/avisos/cercanos/todos?lat=${lat}&lng=${lng}&radio=${radio}`);
