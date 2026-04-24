import axios from 'axios';

// 🔧 FIX: Auto-detecta TODOS los entornos
const getBaseURL = () => {
  // Vercel (nuevo)
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Create React App (legacy)
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  
  // Development
  if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // Production (backend URL)
  return 'https://cotizgomez.free.nf';
};

// Instancia base de axios con la URL del backend PHP
const api = axios.create({
  baseURL: getBaseURL(),  // ← SIN /api aquí
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor global de errores: muestra el mensaje del servidor si existe
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || 'Error de conexión con el servidor';
    console.error('API Error:', msg);
    return Promise.reject(err);
  }
);

export const productosAPI = {
  getAll:  ()       => api.get('api/productos'),      // ← api/ agregado
  getOne:  (id)     => api.get(`api/productos/${id}`),
  create:  (data)   => api.post('api/productos', data),
  update:  (id, d)  => api.put(`api/productos/${id}`, d),
  delete:  (id)     => api.delete(`api/productos/${id}`)
};

export const clientesAPI = {
  getAll:  ()       => api.get('api/clientes'),
  getOne:  (id)     => api.get(`api/clientes/${id}`),
  create:  (data)   => api.post('api/clientes', data),
  update:  (id, d)  => api.put(`api/clientes/${id}`, d),
  delete:  (id)     => api.delete(`api/clientes/${id}`)
};

export const ventasAPI = {
  getAll:  ()       => api.get('api/ventas'),
  getOne:  (id)     => api.get(`api/ventas/${id}`),
  create:  (data)   => api.post('api/ventas', data)
};

export const cotizacionesAPI = {
  getAll:   ()      => api.get('api/cotizaciones'),
  getOne:   (id)    => api.get(`api/cotizaciones/${id}`),
  create:   (data)  => api.post('api/cotizaciones', data),
  aprobar:  (id)    => api.post(`api/cotizaciones/${id}/aprobar`),
  cancelar: (id)    => api.put(`api/cotizaciones/${id}`, { estado: 'cancelada' })
};

export const preciosAPI = {
  getAll:    ()      => api.get('api/lista-precios'),
  create:    (data)  => api.post('api/lista-precios', data),
  update:    (id, d) => api.put(`api/lista-precios/${id}`, d),
  delete:    (id)    => api.delete(`api/lista-precios/${id}`)
};

export const cuentaAPI = {
  getResumen:   ()     => api.get('api/cuenta-corriente'),
  getByCliente: (id)   => api.get(`api/cuenta-corriente/${id}`),
  registrar:    (data) => api.post('api/cuenta-corriente', data)
};
