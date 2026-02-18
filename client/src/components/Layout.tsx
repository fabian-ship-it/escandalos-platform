import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      <nav className="bg-[#1a1a2e] border-b border-[#2a2a4e] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 text-white no-underline">
          <div className="text-2xl font-black tracking-tight">
            <span className="text-scandal-accent">ESCANDALO</span>
            <span className="text-scandal-gold">S</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              location.pathname === '/' ? 'bg-[#2a2a4e] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tablero
          </Link>
          <Link
            to="/submit"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              location.pathname === '/submit'
                ? 'bg-scandal-accent text-white'
                : 'text-scandal-accent border border-scandal-accent hover:bg-scandal-accent hover:text-white'
            }`}
          >
            Enviar Pista Anónima
          </Link>

          {user ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#2a2a4e]">
              <Link
                to="/admin/dashboard"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Panel Admin
              </Link>
              <Link
                to="/admin/manage"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Gestionar
              </Link>
              <span className="text-xs text-gray-500">{user.username}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-scandal-accent transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-2"
            >
              Admin
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
