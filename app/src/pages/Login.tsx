export function Login() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--ghw-bg)" }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <img
          src="/icon-v2-512.png"
          alt="GH-Watch"
          width="512"
          height="512"
          className="h-[150px] w-[150px] rounded-2xl"
        />

        {/* Login card */}
        <div
          className="w-80 rounded-lg border p-6"
          style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
        >
          <h1
            className="mb-2 text-center text-xl font-semibold"
            style={{ color: "var(--ghw-text)" }}
          >
            GH-Watch
          </h1>
          <p
            className="mb-6 text-center text-sm"
            style={{ color: "var(--ghw-text-muted)" }}
          >
            Monitor your GitHub Actions
          </p>
          <a
            href={`${import.meta.env.VITE_API_URL || "/api"}/auth/login`}
            className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--ghw-btn-green)" }}
          >
            <i className="fa-brands fa-github text-lg" />
            Login via GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
