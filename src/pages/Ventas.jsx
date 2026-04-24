import { useState, useEffect } from 'react';
import { ventasAPI, clientesAPI, productosAPI } from '../services/api';

export default function Ventas() {
  const [ventas, setVentas]       = useState([]);
  const [clientes, setClientes]   = useState([]);
  const [productos, setProductos] = useState([]);
  const [vista, setVista]         = useState('lista'); // 'lista' | 'nueva'
  const [error, setError]         = useState('');

  // Estado del formulario de nueva venta
  const [clienteId, setClienteId]   = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObs]     = useState('');
  const [carrito, setCarrito]       = useState([]); // ítems del carrito
  const [buscarProd, setBuscarProd] = useState('');

  const cargar = () => ventasAPI.getAll().then(r => setVentas(r.data));
  useEffect(() => {
    cargar();
    clientesAPI.getAll().then(r => setClientes(r.data));
    productosAPI.getAll().then(r => setProductos(r.data));
  }, []);

  // Agrega un producto al carrito o incrementa su cantidad si ya existe
  const agregarAlCarrito = (prod) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto_id === prod.id);
      if (existe) {
        return prev.map(i => i.producto_id === prod.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario }
          : i
        );
      }
      return [...prev, {
        producto_id: prod.id,
        nombre: prod.nombre,
        codigo: prod.codigo,
        precio_unitario: parseFloat(prod.precio_venta),
        cantidad: 1,
        subtotal: parseFloat(prod.precio_venta)
      }];
    });
    setBuscarProd('');
  };

  const cambiarCantidad = (productoId, cantidad) => {
    const n = parseInt(cantidad);
    if (n < 1) return;
    setCarrito(prev => prev.map(i =>
      i.producto_id === productoId
        ? { ...i, cantidad: n, subtotal: n * i.precio_unitario }
        : i
    ));
  };

  const cambiarPrecio = (productoId, precio) => {
    const p = parseFloat(precio);
    if (isNaN(p) || p < 0) return;
    setCarrito(prev => prev.map(i =>
      i.producto_id === productoId
        ? { ...i, precio_unitario: p, subtotal: i.cantidad * p }
        : i
    ));
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(prev => prev.filter(i => i.producto_id !== productoId));
  };

  // Total calculado desde el carrito
  const total = carrito.reduce((sum, i) => sum + i.subtotal, 0);

  const confirmarVenta = async () => {
    if (!clienteId)        { setError('Seleccioná un cliente');        return; }
    if (carrito.length < 1){ setError('Agregá al menos un producto');   return; }
    setError('');
    try {
      await ventasAPI.create({
        cliente_id:    parseInt(clienteId),
        usuario_id:    1, // en una app con login vendría del token
        total,
        metodo_pago:   metodoPago,
        observaciones,
        items: carrito.map(i => ({
          producto_id:    i.producto_id,
          cantidad:       i.cantidad,
          precio_unitario: i.precio_unitario
        }))
      });
      // Limpiar formulario y volver a la lista
      setCarrito([]); setClienteId(''); setMetodoPago('efectivo'); setObs('');
      setVista('lista'); cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrar la venta');
    }
  };

  // Productos filtrados para el buscador del carrito
  const prodFiltrados = buscarProd.length > 1
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(buscarProd.toLowerCase()) ||
        p.codigo.toLowerCase().includes(buscarProd.toLowerCase())
      ).slice(0, 8)
    : [];

  if (vista === 'nueva') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setVista('lista')} style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Volver</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1e293b' }}>Nueva venta</h2>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

          {/* PANEL IZQUIERDO: buscador de productos + carrito */}
          <div>
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '0.5px solid #e2e8f0', marginBottom: 12, position: 'relative' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 14, color: '#475569' }}>Buscar producto</p>
              <input
                placeholder="Escribí nombre o código..."
                value={buscarProd}
                onChange={e => setBuscarProd(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              />
              {/* Dropdown de resultados */}
              {prodFiltrados.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 6, background: '#fff', overflow: 'hidden' }}>
                  {prodFiltrados.map(p => (
                    <div key={p.id} onClick={() => agregarAlCarrito(p)}
                      style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <span><strong>{p.codigo}</strong> — {p.nombre}</span>
                      <span style={{ color: '#16a34a', fontWeight: 500 }}>$ {parseFloat(p.precio_venta).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARRITO */}
            <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Producto', 'Precio unit.', 'Cantidad', 'Subtotal', ''].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.producto_id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontWeight: 500 }}>{item.nombre}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.codigo}</div>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <input type="number" value={item.precio_unitario} min="0" step="0.01"
                          onChange={e => cambiarPrecio(item.producto_id, e.target.value)}
                          style={{ width: 80, padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }} />
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <input type="number" value={item.cantidad} min="1"
                          onChange={e => cambiarCantidad(item.producto_id, e.target.value)}
                          style={{ width: 60, padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }} />
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 500 }}>$ {item.subtotal.toFixed(2)}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <button onClick={() => quitarDelCarrito(item.producto_id)}
                          style={{ padding: '3px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {carrito.length === 0 && (
                <p style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>Buscá y agregá productos</p>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: datos de la venta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '0.5px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 500, fontSize: 14, color: '#475569' }}>Datos de la venta</p>

              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 4 }}>Cliente</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                <option value="">Seleccioná un cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>

              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 4 }}>Método de pago</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cuenta_corriente">Cuenta corriente</option>
              </select>

              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 500, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <textarea value={observaciones} onChange={e => setObs(e.target.value)} rows={3}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            {/* TOTAL Y CONFIRMAR */}
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, color: '#fff' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Total de la venta</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>$ {total.toFixed(2)}</div>
              <button onClick={confirmarVenta}
                style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                Confirmar venta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA LISTA DE VENTAS
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#1e293b' }}>Ventas</h2>
        <button onClick={() => setVista('nueva')}
          style={{ padding: '9px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          + Nueva venta
        </button>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'Cliente', 'Total', 'Método de pago', 'Fecha', 'Observaciones'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{v.id}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{v.cliente_nombre}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#16a34a' }}>$ {parseFloat(v.total).toFixed(2)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 12, fontSize: 11, color: '#475569' }}>
                    {v.metodo_pago?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(v.fecha_venta).toLocaleDateString('es-AR')}</td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>{v.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ventas.length === 0 && <p style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Sin ventas registradas</p>}
      </div>
    </div>
  );
}