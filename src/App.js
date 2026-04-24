import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Productos      from './pages/Productos';
import Clientes       from './pages/Clientes';
import Ventas         from './pages/Ventas';
import Cotizaciones   from './pages/Cotizaciones';
import ListaPrecios   from './pages/ListaPrecios';
import CuentaCorriente from './pages/CuentaCorriente';

// Definición de la navegación lateral
const nav = [
  { to: '/',                  label: 'Productos',        icon: '📦' },
  { to: '/clientes',          label: 'Clientes',         icon: '👥' },
  { to: '/ventas',            label: 'Ventas',           icon: '🛒' },
  { to: '/cotizaciones',      label: 'Cotizaciones',     icon: '📋' },
  { to: '/lista-precios',     label: 'Lista de precios', icon: '💲' },
  { to: '/cuenta-corriente',  label: 'Cta. Corriente',   icon: '📒' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f1f5f9' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 220, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #334155' }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Sistema de Gestión</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>admin@mitienda.com</div>
          </div>
          <nav style={{ flex: 1, padding: '10px 0' }}>
            {nav.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 18px', fontSize: 13,
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  background: isActive ? '#0f172a' : 'transparent',
                  textDecoration: 'none',
                  borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent'
                })}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '12px 18px', borderTop: '1px solid #334155', fontSize: 11, color: '#475569' }}>
            PHP + React + MySQL
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <Routes>
            <Route path="/"                 element={<Productos />} />
            <Route path="/clientes"         element={<Clientes />} />
            <Route path="/ventas"           element={<Ventas />} />
            <Route path="/cotizaciones"     element={<Cotizaciones />} />
            <Route path="/lista-precios"    element={<ListaPrecios />} />
            <Route path="/cuenta-corriente" element={<CuentaCorriente />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}