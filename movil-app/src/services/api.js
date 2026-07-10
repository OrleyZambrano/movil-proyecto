import { leerToken } from './storage';

const API_URL = 'http://192.168.100.38:8000/api';
const API_TIMEOUT = 15000;

async function request(endpoint, options = {}) {
  const token = await leerToken();
  const headers = { Accept: 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
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

export const register = (name, email, password, confirmation) =>
  request('/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation: confirmation }) });

export const logout = () => request('/logout', { method: 'POST' });
export const getUser = () => request('/user');

export const getReportes = (params) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/reportes${q}`);
};
export const getReporte = (id) => request(`/reportes/${id}`);
export const createReporte = (formData) => request('/reportes', { method: 'POST', body: formData });
export const updateReporte = (id, data) => request(`/reportes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
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
