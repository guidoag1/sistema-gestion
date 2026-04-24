import axios from 'axios';

// ✅ Detecta TODOS los entornos correctamente
const getBaseURL = () => {
  return (
    import.meta.env.VITE_API_URL ||      // Vercel nuevo ✅
    process.env.REACT_APP_API_URL ||     // Legacy CRA ✅
    (import.meta.env.DEV ? 'http://localhost:8000' : 'https://cotizgomez.free.nf')
  );
};

const api = axios.create({
  baseURL: getBaseURL(),  // Sin /api aquí
  headers: { 'Content-Type': 'application/json' }
});

export const productosAPI = {
  getAll:  ()       => api.get('api/productos'),     // ← api/ aquí
  getOne:  (id)     => api.get(`api/productos/${id}`),
  create:  (data)   => api.post('api/productos', data),
  update:  (id, d)  => api.put(`api/productos/${id}`, d),
  delete:  (id)     => api.delete(`api/productos/${id}`)
};

// ... resto igual pero con 'api/' al inicio de cada endpoint
export const clientesAPI = {
  getAll:  ()       => api.get('api/clientes'),
  create:  (data)   => api.post('api/clientes', data),
  update:  (id, d)  => api.put(`api/clientes/${id}`, d),
  delete:  (id)     => api.delete(`api/clientes/${id}`)
};

export const stockAPI = {
  getAll:     ()     => api.get('api/stock'),
  movimiento: (data) => api.post('api/stock/movimiento', data)
};

export const preciosAPI = {
  getAll:  ()       => api.get('api/listas-precio'),
  create:  (data)   => api.post('api/listas-precio', data),
  update:  (id, d)  => api.put(`api/listas-precio/${id}`, d)
};

export const cuentaAPI = {
  getByCliente: (id)   => api.get(`api/cuenta-corriente/${id}`),
  registrar:    (data) => api.post('api/cuenta-corriente', data)
};
