import { useState, useEffect } from 'react';
import { cotizacionesAPI, clientesAPI, productosAPI } from '../services/api';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes]         = useState([]);
  const [productos, setProductos]       = useState([]);
  const [vista, setVista]               = useState('lista');
  const [clienteId, setClienteId]       = useState('');
  const [observaciones, setObs]         = useState('');
  const [carrito, setCarrito]           = useState([]);
  const [buscarProd, setBuscarProd]     = useState('');
  const [error, setError]               = useState('');

  const cargar = () => cotizacionesAPI.getAll().then(r => setCotizaciones(r.data));
  useEffect(() => {
    cargar();
    clientesAPI.getAll().then(r => setClientes(r.data));
    productosAPI.getAll().then(r => setProductos(r.data));
  }, []);

  const agregar = prod => {
    setCarrito(prev => {
      const ex = prev.find(i => i.producto_id === prod.id);
      if (ex) return prev.map(i => i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario } : i);
      return [...prev, { producto_id: prod.id, nombre: prod.nombre, codigo: prod.codigo, precio_unitario: parseFloat(prod.precio_venta), cantidad: 1, subtotal: parseFloat(prod.precio_venta) }];
    });
    setBuscarProd('');
  };

  const total = carrito.reduce((s, i) => s + i.subtotal, 0);

  const confirmar = async () => {
    if (!clienteId || carrito.length < 1) { setError('Completá cliente y productos'); return; }
    setError('');
    try {
      await cotizacionesAPI.create({ cliente_id: parseInt(clienteId), usuario_id: 1, total, observaciones, items: carrito });
      setCarrito([]); setClienteId(''); setObs(''); setVista('lista'); cargar();
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const aprobar = async (id) => {
    if (!window.confirm('¿Aprobar esta cotización y generar una venta?')) return;
    try { await cotizacionesAPI.aprobar(id); cargar(); }
    catch (e) { alert(e.response?.data?.error || 'Error al aprobar'); }
  };

  const cancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta cotización?')) return;
    await cotizacionesAPI.cancelar(id); cargar();
  };

  const estadoColor = { pendiente: { bg: '#fef9c3', color: '#854d0e' }, aprobada: { bg: '#dcfce7', color: '#166534' }, cancelada: { bg: '#fee2e2', color: '#991b1b' } };

  const prodFiltrados = buscarProd.length > 1
    ? productos.filter(p => p.nombre.toLowerCase().includes(buscarProd.toLowerCase()) || p.codigo.toLowerCase().includes(buscarProd.toLowerCase())).slice(0, 8)
    : [];

  if (vista === 'nueva') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setVista('lista')} style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Volver</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Nueva cotización</h2>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div>
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '0.5px solid #e2e8f0', marginBottom: 12 }}>
              <input placeholder="Buscar producto..." value={buscarProd} onChange={e => setBuscarProd(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              {prodFiltrados.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 6, background: '#fff', overflow: 'hidden' }}>
                  {prodFiltrados.map(p => (
                    <div key={p.id} onClick={() => agregar(p)}
                      style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <span><strong>{p.codigo}</strong> — {p.nombre}</span>
                      <span style={{ color: '#16a34a' }}>$ {parseFloat(p.precio_venta).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Producto', 'Precio', 'Cant.', 'Subtotal', ''].map(h => <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.producto_id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                      <td style={{ padding: '9px 12px', fontWeight: 500 }}>{item.nombre}</td>
                      <td style={{ padding: '9px 12px' }}>$ {item.precio_unitario.toFixed(2)}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <input type="number" value={item.cantidad} min="1"
                          onChange={e => setCarrito(prev => prev.map(i => i.producto_id === item.producto_id ? { ...i, cantidad: parseInt(e.target.value) || 1, subtotal: (parseInt(e.target.value) || 1) * i.precio_unitario } : i))}
                          style={{ width: 56, padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }} />
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 500 }}>$ {item.subtotal.toFixed(2)}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <button onClick={() => setCarrito(prev => prev.filter(i => i.producto_id !== item.producto_id))}
                          style={{ padding: '3px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {carrito.length === 0 && <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>Sin ítems</p>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '0.5px solid #e2e8f0' }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 4 }}>Cliente</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                <option value="">Seleccioná un cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <textarea value={observaciones} onChange={e => setObs(e.target.value)} rows={3}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, color: '#fff' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Total cotización</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 16 }}>$ {total.toFixed(2)}</div>
              <button onClick={confirmar} style={{ width: '100%', padding: '11px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Guardar cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Cotizaciones</h2>
        <button onClick={() => setVista('nueva')} style={{ padding: '9px 20px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          + Nueva cotización
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['#', 'Cliente', 'Total', 'Estado', 'Fecha', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {cotizaciones.map(c => {
              const col = estadoColor[c.estado] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{c.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{c.cliente_nombre}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#16a34a' }}>$ {parseFloat(c.total).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: col.bg, color: col.color, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>{c.estado}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{c.fecha_cotizacion}</td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                    {c.estado === 'pendiente' && <>
                      <button onClick={() => aprobar(c.id)} style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Aprobar</button>
                      <button onClick={() => cancelar(c.id)} style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    </>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cotizaciones.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Sin cotizaciones</p>}
      </div>
    </div>
  );
}