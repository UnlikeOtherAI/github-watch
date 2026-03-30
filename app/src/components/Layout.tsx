import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const navItems = [
  { to: "/", icon: "fa-solid fa-gauge-high", label: "Dashboard" },
  { to: "/setup", icon: "fa-solid fa-gear", label: "Setup" },
];

export function Layout() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#0d1117]">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#30363d] bg-[#161b22]
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-[#30363d] px-4">
          <i className="fa-solid fa-eye text-[#58a6ff]" />
          <span className="text-base font-bold text-white">GH-Watch</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/" || location.pathname === ""
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                  ${
                    isActive
                      ? "border-l-[3px] border-l-[#58a6ff] bg-[#1c2128] pl-[9px] text-white"
                      : "border-l-[3px] border-l-transparent pl-[9px] text-[#8b949e] hover:bg-[#1c2128] hover:text-[#e6edf3]"
                  }
                `}
              >
                <i className={`${item.icon} w-4 text-center`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[#30363d] px-3 py-3">
          <a
            href="/api/auth/logout"
            onClick={(e) => {
              e.preventDefault();
              fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              }).then(() => {
                window.location.href = "/";
              });
            }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#8b949e] transition-colors hover:bg-[#1c2128] hover:text-[#e6edf3]"
          >
            <i className="fa-solid fa-right-from-bracket w-4 text-center" />
            Logout
          </a>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-[#8b949e] hover:text-[#e6edf3]"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <div className="flex-1" />

          {/* User avatar */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-[#8b949e] sm:inline">
                {user.login}
              </span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.login}
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#30363d] text-xs text-[#8b949e]">
                  {user.login[0]?.toUpperCase()}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
