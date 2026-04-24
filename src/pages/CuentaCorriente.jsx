import { useState, useEffect } from 'react';
import { cuentaAPI, clientesAPI } from '../services/api';

export default function CuentaCorriente() {
  const [resumen, setResumen]         = useState([]);
  const [selCliente, setSelCliente]   = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({
    tipo_movimiento: 'cargo',
    descripcion: '',
    monto: '',
    fecha_movimiento: new Date().toISOString().split('T')[0]
  });

  const cargarResumen = () => cuentaAPI.getResumen().then(r => setResumen(r.data));
  useEffect(() => { cargarResumen(); }, []);

  const verMovimientos = (cliente) => {
    setSelCliente(cliente);
    cuentaAPI.getByCliente(cliente.id).then(r => setMovimientos(r.data));
  };

  const registrar = async () => {
    if (!form.monto || !form.descripcion) { alert('Completá todos los campos'); return; }
    try {
      await cuentaAPI.registrar({ ...form, cliente_id: selCliente.id });
      setForm({ tipo_movimiento: 'cargo', descripcion: '', monto: '', fecha_movimiento: new Date().toISOString().split('T')[0] });
      // Refrescar movimientos y resumen de saldos
      cuentaAPI.getByCliente(selCliente.id).then(r => setMovimientos(r.data));
      cargarResumen();
    } catch (e) { alert(e.response?.data?.error || 'Error al registrar'); }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Cuenta corriente</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

        {/* LISTA DE CLIENTES CON SALDOS */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 500, color: '#64748b' }}>
            CLIENTES
          </div>
          {resumen.map(c => (
            <div key={c.id} onClick={() => verMovimientos(c)}
              style={{
                padding: '12px 14px', cursor: 'pointer', borderBottom: '0.5px solid #f1f5f9',
                background: selCliente?.id === c.id ? '#eff6ff' : '#fff',
                borderLeft: selCliente?.id === c.id ? '3px solid #3b82f6' : '3px solid transparent'
              }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nombre}</div>
              <div style={{ fontSize: 12, marginTop: 2, fontWeight: 600, color: parseFloat(c.saldo) > 0 ? '#dc2626' : '#16a34a' }}>
                Saldo: $ {parseFloat(c.saldo || 0).toFixed(2)}
              </div>
            </div>
          ))}
          {resumen.length === 0 && <p style={{ padding: 16, color: '#94a3b8', fontSize: 13 }}>Sin clientes</p>}
        </div>

        {/* DETALLE DEL CLIENTE SELECCIONADO */}
        {selCliente ? (
          <div>
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '0.5px solid #e2e8f0', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{selCliente.nombre}</p>
                <span style={{ fontSize: 18, fontWeight: 700, color: parseFloat(selCliente.saldo) > 0 ? '#dc2626' : '#16a34a' }}>
                  Saldo: $ {parseFloat(selCliente.saldo || 0).toFixed(2)}
                </span>
              </div>

              {/* FORMULARIO DE MOVIMIENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Tipo</label>
                  <select value={form.tipo_movimiento} onChange={e => setForm({ ...form, tipo_movimiento: e.target.value })}
                    style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}>
                    <option value="cargo">Cargo (deuda)</option>
                    <option value="abono">Abono (pago)</option>
                  </select>
                </div>
                {[
                  { key: 'descripcion',       label: 'Descripción', type: 'text' },
                  { key: 'monto',             label: 'Monto',       type: 'number' },
                  { key: 'fecha_movimiento',  label: 'Fecha',       type: 'date' },
                ].map(({ key, label, type }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{label}</label>
                    <input type={type} placeholder={label} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }} />
                  </div>
                ))}
              </div>
              <button onClick={registrar} style={{ marginTop: 12, padding: '8px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                Registrar movimiento
              </button>
            </div>

            {/* HISTORIAL */}
            <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Fecha', 'Tipo', 'Descripción', 'Monto', 'Saldo'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                      <td style={{ padding: '9px 12px', color: '#64748b' }}>{m.fecha_movimiento}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ background: m.tipo_movimiento === 'cargo' ? '#fee2e2' : '#dcfce7', color: m.tipo_movimiento === 'cargo' ? '#dc2626' : '#16a34a', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>
                          {m.tipo_movimiento}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px' }}>{m.descripcion}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 500 }}>$ {parseFloat(m.monto).toFixed(2)}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: parseFloat(m.saldo) > 0 ? '#dc2626' : '#16a34a' }}>
                        $ {parseFloat(m.saldo).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {movimientos.length === 0 && <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Sin movimientos</p>}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 14, background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0' }}>
            Seleccioná un cliente para ver su cuenta
          </div>
        )}
      </div>
    </div>
  );
}