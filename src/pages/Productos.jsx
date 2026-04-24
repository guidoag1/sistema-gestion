import { useState, useEffect } from 'react';
import { productosAPI } from '../services/api';

// Valores iniciales del formulario vacío
const VACIO = { codigo: '', nombre: '', descripcion: '', precio_costo: '', precio_venta: '', stock_actual: '', stock_minimo: '' };

// Componente reutilizable para campo de formulario
function Campo({ label, name, form, setForm, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        placeholder={label}
        value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
        style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
      />
    </div>
  );
}

export default function Productos() {
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(VACIO);
  const [editId, setEditId]   = useState(null);
  const [buscar, setBuscar]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Carga la lista de productos desde la API
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await productosAPI.getAll();
      setItems(res.data);
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!form.codigo || !form.nombre || !form.precio_venta) {
      setError('Código, nombre y precio de venta son obligatorios');
      return;
    }
    setError('');
    try {
      if (editId) {
        await productosAPI.update(editId, form);
      } else {
        await productosAPI.create(form);
      }
      setForm(VACIO);
      setEditId(null);
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const editar = p => {
    // Precarga el formulario con los datos del producto seleccionado
    setForm({ ...p });
    setEditId(p.id);
    window.scrollTo(0, 0);
  };

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await productosAPI.delete(id);
    cargar();
  };

  // Filtra en tiempo real por nombre o código
  const filtrados = items.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    p.codigo.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Productos</h2>

      {/* FORMULARIO */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, border: '0.5px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 14px', fontWeight: 500, fontSize: 14, color: '#475569' }}>
          {editId ? '✏️ Editando producto' : '➕ Nuevo producto'}
        </p>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <Campo label="Código *"         name="codigo"        form={form} setForm={setForm} />
          <Campo label="Nombre *"         name="nombre"        form={form} setForm={setForm} />
          <Campo label="Descripción"      name="descripcion"   form={form} setForm={setForm} />
          <Campo label="Precio costo"     name="precio_costo"  form={form} setForm={setForm} type="number" />
          <Campo label="Precio venta *"   name="precio_venta"  form={form} setForm={setForm} type="number" />
          <Campo label="Stock inicial"    name="stock_actual"  form={form} setForm={setForm} type="number" />
          <Campo label="Stock mínimo"     name="stock_minimo"  form={form} setForm={setForm} type="number" />
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button onClick={guardar}
            style={{ padding: '8px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {editId ? 'Actualizar' : 'Agregar'}
          </button>
          {editId && (
            <button onClick={() => { setForm(VACIO); setEditId(null); setError(''); }}
              style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* BUSCADOR */}
      <input placeholder="Buscar por nombre o código..."
        value={buscar} onChange={e => setBuscar(e.target.value)}
        style={{ width: '100%', padding: '9px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }}
      />

      {/* TABLA */}
      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Cargando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Código', 'Nombre', 'Precio costo', 'Precio venta', 'Stock', 'Mín.', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{p.codigo}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                    {p.nombre}
                    {/* Alerta visual si el stock está bajo el mínimo */}
                    {p.stock_bajo == 1 && <span style={{ marginLeft: 6, background: '#fee2e2', color: '#dc2626', fontSize: 10, padding: '1px 6px', borderRadius: 10 }}>stock bajo</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>$ {parseFloat(p.precio_costo).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#16a34a' }}>$ {parseFloat(p.precio_venta).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: p.stock_actual > 0 ? '#dcfce7' : '#fee2e2', color: p.stock_actual > 0 ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>
                      {p.stock_actual}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{p.stock_minimo}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => editar(p)} style={{ marginRight: 6, padding: '4px 10px', background: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                    <button onClick={() => eliminar(p.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtrados.length === 0 && (
          <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Sin resultados</p>
        )}
      </div>
    </div>
  );
}