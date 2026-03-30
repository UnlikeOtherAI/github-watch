import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const navItems = [
  { to: "/", icon: "fa-solid fa-gauge-high", label: "Dashboard" },
  { to: "/setup", icon: "fa-solid fa-gear", label: "Setup" },
];

function getTheme(): "dark" | "light" {
  const cookie = document.cookie.match(/(?:^|; )ghw_theme=([^;]*)/);
  return cookie?.[1] === "light" ? "light" : "dark";
}

function setTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `ghw_theme=${theme};path=/;max-age=${365 * 24 * 60 * 60}`;
}

export function Layout() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">(getTheme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  function toggleTheme(t: "dark" | "light") {
    setTheme(t);
    setThemeState(t);
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--ghw-bg)" }}>
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
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "var(--ghw-bg-card)",
          borderColor: "var(--ghw-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center gap-2 border-b px-4"
          style={{ borderColor: "var(--ghw-border)" }}
        >
          <i className="fa-solid fa-eye" style={{ color: "var(--ghw-blue)" }} />
          <span className="text-base font-bold" style={{ color: "var(--ghw-text)" }}>
            GH-Watch
          </span>
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
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                style={{
                  borderLeft: isActive ? "3px solid var(--ghw-blue)" : "3px solid transparent",
                  backgroundColor: isActive ? "var(--ghw-bg-elevated)" : "transparent",
                  color: isActive ? "var(--ghw-text)" : "var(--ghw-text-muted)",
                  paddingLeft: "9px",
                }}
              >
                <i className={`${item.icon} w-4 text-center`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme + Logout */}
        <div className="border-t px-3 py-3" style={{ borderColor: "var(--ghw-border)" }}>
          {/* Theme toggle */}
          <div className="mb-2 flex gap-1 px-3">
            <button
              onClick={() => toggleTheme("light")}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                backgroundColor: theme === "light" ? "var(--ghw-bg-elevated)" : "transparent",
                color: theme === "light" ? "var(--ghw-yellow)" : "var(--ghw-text-muted)",
                border: theme === "light" ? "1px solid var(--ghw-border)" : "1px solid transparent",
              }}
              title="Light mode"
            >
              <i className="fa-solid fa-sun text-sm" />
            </button>
            <button
              onClick={() => toggleTheme("dark")}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                backgroundColor: theme === "dark" ? "var(--ghw-bg-elevated)" : "transparent",
                color: theme === "dark" ? "var(--ghw-blue)" : "var(--ghw-text-muted)",
                border: theme === "dark" ? "1px solid var(--ghw-border)" : "1px solid transparent",
              }}
              title="Dark mode"
            >
              <i className="fa-solid fa-moon text-sm" />
            </button>
          </div>

          {/* Logout */}
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
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
            style={{ color: "var(--ghw-text-muted)" }}
          >
            <i className="fa-solid fa-right-from-bracket w-4 text-center" />
            Logout
          </a>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b px-4"
          style={{
            backgroundColor: "var(--ghw-bg-card)",
            borderColor: "var(--ghw-border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 transition-colors"
            style={{ color: "var(--ghw-text-muted)" }}
          >
            <i className="fa-solid fa-bars" />
          </button>
          <div className="flex-1" />

          {user && (
            <div className="flex items-center gap-2">
              <span
                className="hidden text-sm sm:inline"
                style={{ color: "var(--ghw-text-muted)" }}
              >
                {user.login}
              </span>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.login}
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                  style={{
                    backgroundColor: "var(--ghw-border)",
                    color: "var(--ghw-text-muted)",
                  }}
                >
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
