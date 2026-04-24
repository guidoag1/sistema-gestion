import { useState, useEffect } from 'react';
import { preciosAPI, productosAPI } from '../services/api';

export default function ListaPrecios() {
  const [precios, setPrecios]     = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm]           = useState({ producto_id: '', precio: '', nombre_lista: 'General', vigente_hasta: '' });
  const [editId, setEditId]       = useState(null);
  const [filtroLista, setFiltro]  = useState('');

  const cargar = () => preciosAPI.getAll().then(r => setPrecios(r.data));
  useEffect(() => { cargar(); productosAPI.getAll().then(r => setProductos(r.data)); }, []);

  const guardar = async () => {
    if (!form.producto_id || !form.precio) return alert('Producto y precio son obligatorios');
    editId ? await preciosAPI.update(editId, form) : await preciosAPI.create(form);
    setForm({ producto_id: '', precio: '', nombre_lista: 'General', vigente_hasta: '' });
    setEditId(null); cargar();
  };

  // Obtener nombres únicos de listas para el filtro
  const listas = [...new Set(precios.map(p => p.nombre_lista))];
  const filtrados = filtroLista ? precios.filter(p => p.nombre_lista === filtroLista) : precios;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Lista de precios</h2>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, border: '0.5px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 500, fontSize: 14, color: '#475569' }}>{editId ? '✏️ Editar precio' : '➕ Agregar precio'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Producto</label>
            <select value={form.producto_id} onChange={e => setForm({ ...form, producto_id: e.target.value })}
              style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}>
              <option value="">Seleccioná producto</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          {[
            { key: 'precio',       label: 'Precio',        type: 'number' },
            { key: 'nombre_lista', label: 'Nombre de lista', type: 'text' },
            { key: 'vigente_hasta',label: 'Vigente hasta',  type: 'date'   },
          ].map(({ key, label, type }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</label>
              <input type={type} placeholder={label} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button onClick={guardar} style={{ padding: '8px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {editId ? 'Actualizar' : 'Agregar'}
          </button>
          {editId && <button onClick={() => { setForm({ producto_id: '', precio: '', nombre_lista: 'General', vigente_hasta: '' }); setEditId(null); }}
            style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>}
        </div>
      </div>

      {/* Filtro por lista */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFiltro('')}
          style={{ padding: '5px 14px', background: !filtroLista ? '#3b82f6' : '#f1f5f9', color: !filtroLista ? '#fff' : '#475569', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>
          Todas
        </button>
        {listas.map(l => (
          <button key={l} onClick={() => setFiltro(l)}
            style={{ padding: '5px 14px', background: filtroLista === l ? '#3b82f6' : '#f1f5f9', color: filtroLista === l ? '#fff' : '#475569', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['Código', 'Producto', 'Lista', 'Precio', 'Vigente hasta', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{p.codigo}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{p.producto_nombre}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{p.nombre_lista}</span>
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#16a34a' }}>$ {parseFloat(p.precio).toFixed(2)}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.vigente_hasta || '—'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => { setForm(p); setEditId(p.id); }} style={{ marginRight: 6, padding: '4px 10px', background: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                  <button onClick={async () => { if (window.confirm('¿Eliminar?')) { await preciosAPI.delete(p.id); cargar(); }}}
                    style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Sin precios cargados</p>}
      </div>
    </div>
  );
}