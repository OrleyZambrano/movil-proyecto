import { Platform } from 'react-native';
import { leerToken } from './storage';

const API_URL = 'http://192.168.88.56:8000/api';
const API_BASE = 'http://192.168.88.56:8000';
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
    if (e.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Verifica tu conexión.');
    if (e.message === 'Network request failed') throw new Error('Sin conexión al servidor');
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
