import { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';

const VACIO = { nombre: '', documento: '', email: '', telefono: '', direccion: '' };

export default function Clientes() {
  const [items, setItems]   = useState([]);
  const [form, setForm]     = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [error, setError]   = useState('');

  const cargar = () => clientesAPI.getAll().then(r => setItems(r.data));
  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (!form.nombre) { setError('El nombre es obligatorio'); return; }
    setError('');
    try {
      editId ? await clientesAPI.update(editId, form) : await clientesAPI.create(form);
      setForm(VACIO); setEditId(null); cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const campos = [
    { key: 'nombre',    label: 'Nombre *' },
    { key: 'documento', label: 'CUIT / DNI' },
    { key: 'email',     label: 'Email' },
    { key: 'telefono',  label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' },
  ];

  const filtrados = items.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (c.documento || '').includes(buscar)
  );

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Clientes</h2>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, border: '0.5px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 14px', fontWeight: 500, fontSize: 14, color: '#475569' }}>
          {editId ? '✏️ Editando cliente' : '➕ Nuevo cliente'}
        </p>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {campos.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</label>
              <input
                placeholder={label}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button onClick={guardar} style={{ padding: '8px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {editId ? 'Actualizar' : 'Agregar'}
          </button>
          {editId && <button onClick={() => { setForm(VACIO); setEditId(null); }}
            style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Cancelar
          </button>}
        </div>
      </div>

      <input placeholder="Buscar por nombre o documento..."
        value={buscar} onChange={e => setBuscar(e.target.value)}
        style={{ width: '100%', padding: '9px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }}
      />

      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Nombre', 'Documento', 'Email', 'Teléfono', 'Saldo', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(c => (
              <tr key={c.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{c.nombre}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{c.documento}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{c.email}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{c.telefono}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontWeight: 600, color: parseFloat(c.saldo_acumulado) > 0 ? '#dc2626' : '#16a34a' }}>
                    $ {parseFloat(c.saldo_acumulado || 0).toFixed(2)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => { setForm(c); setEditId(c.id); }}
                    style={{ marginRight: 6, padding: '4px 10px', background: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                  <button onClick={async () => { if (window.confirm('¿Eliminar?')) { await clientesAPI.delete(c.id); cargar(); }}}
                    style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Sin clientes</p>}
      </div>
    </div>
  );
}