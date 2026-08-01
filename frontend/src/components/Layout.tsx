/**
 * Layout principal — Navbar con logo, usuario, navegación y logout.
 * Todos los menús siempre visibles. Mobile: hamburger menu.
 */
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useT } from "../hooks/useT";

interface LayoutProps {
  children: React.ReactNode;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive ? "bg-indigo-500/20 text-indigo-300" : "opacity-70 hover:opacity-100 hover:bg-white/5"}`;

interface NavItemsProps {
  t: (key: string) => string;
}

function NavItems({ t }: Readonly<NavItemsProps>) {
  return (
    <>
      <NavLink to="/dashboard" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
        {t("nav.dashboard")}
      </NavLink>
      <NavLink to="/projects" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        Proyectos
      </NavLink>
      <NavLink to="/admin" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        {t("nav.admin")}
      </NavLink>
      <NavLink to="/settings" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {t("nav.settings")}
      </NavLink>
      <NavLink to="/templates" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        {t("nav.templates")}
      </NavLink>
      <NavLink to="/profiles" className={navLinkClass}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {t("nav.profiles")}
      </NavLink>
    </>
  );
}

export function Layout({ children }: Readonly<LayoutProps>) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header
        className="text-white px-4 sm:px-6 py-4 shadow-sm z-50 bg-slate-900/95 backdrop-blur-xl sticky top-0 border-b border-white/5"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black text-white">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-widest leading-none">Gestor</span>
              <span className="text-[0.65rem] font-bold text-indigo-300 tracking-wider uppercase hidden sm:block mt-0.5">Proyectos</span>
            </div>
          </Link>

          {/* Nav links — always visible on md */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItems t={t} />
          </nav>

          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-white/90">{user?.email ?? "User"}</span>
                  <span className="text-xs text-indigo-300 capitalize">{user?.role ?? "user"}</span>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-inner">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <svg className="w-4 h-4 opacity-70 text-indigo-200 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 text-slate-700 text-sm animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-3 border-b border-slate-100 mb-2">
                    <p className="font-bold text-slate-900 truncate">{user?.email}</p>
                    <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-1 font-medium">
                      <span className={`w-2 h-2 rounded-full ${user?.role === "admin" ? "bg-purple-500" : "bg-indigo-500"}`} />
                      {user?.role ?? "user"}
                    </p>
                  </div>
                  
                  {/* Mobile nav items within dropdown (fallback) */}
                  <div className="md:hidden px-2 pb-2 mb-2 border-b border-slate-100">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
                      {t("nav.dashboard")}
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors" onClick={() => setMenuOpen(false)}>
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {t("nav.settings")}
                    </Link>
                  </div>

                  <div className="px-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {t("nav.profile")}
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 font-medium transition-colors flex items-center gap-3 mt-1"
                      onClick={handleLogout}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar (Expandable) */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <div className="pt-2 flex flex-col space-y-1">
            <NavItems t={t} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 bg-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-sm font-black text-white">G</span>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-wider">GestorProyectos</span>
            <span className="text-sm text-slate-400">· Sistema de gestión operativo</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">© {new Date().getFullYear()} Aztec</p>
        </div>
      </footer>
    </div>
  );
}
