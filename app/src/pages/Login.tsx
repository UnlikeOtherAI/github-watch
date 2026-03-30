export function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <img
          src="/app/icon-v2-512.png"
          alt="GH-Watch"
          width="512"
          height="512"
          className="h-[150px] w-[150px] rounded-2xl"
        />

        {/* Login card */}
        <div className="w-80 rounded-lg border border-[#30363d] bg-[#161b22] p-6">
          <h1 className="mb-2 text-center text-xl font-semibold text-[#e6edf3]">
            GH-Watch
          </h1>
          <p className="mb-6 text-center text-sm text-[#8b949e]">
            Monitor your GitHub Actions
          </p>
          <a
            href="/api/auth/login"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#238636] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2ea043]"
          >
            <i className="fa-brands fa-github text-lg" />
            Login via GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
