export function renderLanding(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GH-Watch — Monitor your GitHub Actions in one place</title>
  <meta name="description" content="Select the repos and workflows you care about. Get a real-time dashboard for all your CI/CD runs. Self-hosted, fast, no bloat.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ghBg: '#0d1117',
            ghCard: '#161b22',
            ghElevated: '#1c2128',
            ghBorder: '#30363d',
            ghText: '#e6edf3',
            ghMuted: '#8b949e',
            ghBlue: '#58a6ff',
            ghGreen: '#3fb950',
            ghRed: '#f85149',
            ghYellow: '#d29922',
            ghBtnGreen: '#238636',
            ghBtnGreenHover: '#2ea043',
          },
          fontFamily: {
            sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif'],
          },
          fontSize: {
            body: ['14px', '20px'],
          },
          borderRadius: {
            gh: '6px',
            ghLg: '12px',
          },
        },
      },
    };
  </script>
  <style>
    html { scroll-behavior: smooth; }
    body { background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 14px; }
    .gradient-text {
      background: linear-gradient(135deg, #58a6ff 0%, #3fb950 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin-slow { animation: spin-slow 2s linear infinite; }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
    .animate-delay-1 { animation-delay: 0.1s; }
    .animate-delay-2 { animation-delay: 0.2s; }
    .animate-delay-3 { animation-delay: 0.3s; }
    .animate-delay-4 { animation-delay: 0.4s; }
  </style>
</head>
<body class="min-h-screen">

  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-ghBg border-b border-ghBorder">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-white font-bold text-lg">
        <i class="fa-brands fa-github text-xl"></i>
        GH-Watch
      </a>
      <a href="/api/auth/login"
         class="inline-flex items-center gap-2 bg-ghBtnGreen hover:bg-ghBtnGreenHover text-white text-sm font-semibold px-4 py-2 rounded-gh transition-colors">
        <i class="fa-brands fa-github"></i>
        Sign in with GitHub
      </a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight gradient-text pb-2 animate-fade-in-up">
        Monitor your GitHub Actions in one place
      </h1>
      <p class="mt-6 text-lg sm:text-xl text-ghMuted max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-1">
        Select the repos and workflows you care about. Get a real-time dashboard for all your CI/CD runs. Self-hosted, fast, no bloat.
      </p>
      <div class="mt-10 animate-fade-in-up animate-delay-2">
        <a href="/api/auth/login"
           class="inline-flex items-center gap-3 bg-ghBtnGreen hover:bg-ghBtnGreenHover text-white font-semibold text-lg px-8 py-3.5 rounded-gh transition-colors shadow-lg shadow-ghBtnGreen/20">
          <i class="fa-brands fa-github text-xl"></i>
          Get Started with GitHub
        </a>
      </div>
    </div>

    <!-- Mock Dashboard -->
    <div class="max-w-3xl mx-auto mt-16 animate-fade-in-up animate-delay-3">
      <div class="bg-ghCard border border-ghBorder rounded-ghLg overflow-hidden shadow-2xl shadow-black/40">
        <!-- Dashboard header -->
        <div class="px-5 py-3.5 border-b border-ghBorder flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-chart-line text-ghBlue text-sm"></i>
            <span class="text-sm font-semibold text-ghText">Recent Workflow Runs</span>
          </div>
          <span class="text-xs text-ghMuted">Live</span>
        </div>
        <!-- Dashboard rows -->
        <div class="divide-y divide-ghBorder">
          ${dashboardRow("success", "Build & Test", "acme/web-app", "main", "2m ago")}
          ${dashboardRow("failure", "Deploy Production", "acme/web-app", "release/v2.1", "5m ago")}
          ${dashboardRow("running", "Lint & Format", "acme/api-server", "feature/auth", "running")}
          ${dashboardRow("success", "E2E Tests", "acme/web-app", "main", "12m ago")}
          ${dashboardRow("success", "Publish Package", "acme/shared-lib", "main", "18m ago")}
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-20 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl font-bold text-ghText">Everything you need to stay on top of CI/CD</h2>
        <p class="mt-4 text-ghMuted text-lg max-w-xl mx-auto">Simple, focused, and fast. No dashboards you never check.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${featureCard(
          "fa-solid fa-bolt",
          "ghYellow",
          "Real-time Monitoring",
          "See workflow runs update live. Success, failure, in-progress — all at a glance."
        )}
        ${featureCard(
          "fa-solid fa-filter",
          "ghBlue",
          "Choose What Matters",
          "Select specific repos and workflows. No noise, just the pipelines you care about."
        )}
        ${featureCard(
          "fa-solid fa-server",
          "ghGreen",
          "Self-Hosted",
          "Your data stays yours. Deploy on your own infrastructure with a single Docker image."
        )}
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="py-20 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl font-bold text-ghText">Up and running in minutes</h2>
        <p class="mt-4 text-ghMuted text-lg">Three steps to CI/CD clarity.</p>
      </div>
      <div class="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        <!-- Connecting dashed line (desktop only) -->
        <div class="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] border-t-2 border-dashed border-ghBorder" aria-hidden="true"></div>

        ${stepCard("1", "fa-brands fa-github", "Connect GitHub", "Sign in with your GitHub account to grant read access to your workflow data.")}
        ${stepCard("2", "fa-solid fa-list-check", "Select Workflows", "Pick the repos and workflows you want to watch. Filter out the noise.")}
        ${stepCard("3", "fa-solid fa-chart-line", "Monitor", "See all your runs in a unified, real-time dashboard. Never miss a failure.")}
      </div>
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="py-20 px-4 sm:px-6">
    <div class="max-w-3xl mx-auto">
      <div class="bg-ghCard border border-ghBorder rounded-ghLg p-10 sm:p-14 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-ghText">Ready to watch your workflows?</h2>
        <p class="mt-4 text-ghMuted text-lg max-w-lg mx-auto">Stop juggling tabs. See every CI/CD run in one place.</p>
        <div class="mt-8">
          <a href="/api/auth/login"
             class="inline-flex items-center gap-3 bg-ghBtnGreen hover:bg-ghBtnGreenHover text-white font-semibold text-lg px-8 py-3.5 rounded-gh transition-colors shadow-lg shadow-ghBtnGreen/20">
            <i class="fa-brands fa-github text-xl"></i>
            Get Started with GitHub
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-ghBorder py-8 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ghMuted">
      <span>&copy; 2026 GH-Watch. Self-hosted GitHub Actions monitoring.</span>
      <a href="/" class="flex items-center gap-2 text-ghMuted hover:text-ghText transition-colors">
        <i class="fa-brands fa-github"></i>
        GH-Watch
      </a>
    </div>
  </footer>

</body>
</html>`;
}

function dashboardRow(
  status: "success" | "failure" | "running",
  workflow: string,
  repo: string,
  branch: string,
  time: string,
): string {
  const icons: Record<string, string> = {
    success: '<i class="fa-solid fa-check-circle text-ghGreen"></i>',
    failure: '<i class="fa-solid fa-times-circle text-ghRed"></i>',
    running: '<i class="fa-solid fa-circle-notch spin-slow text-ghYellow"></i>',
  };

  const statusLabel: Record<string, string> = {
    success: "completed",
    failure: "failed",
    running: "in progress",
  };

  return `
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-ghElevated/50 transition-colors">
      <span class="text-base flex-shrink-0">${icons[status]}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-semibold text-ghText truncate">${workflow}</span>
          <span class="text-xs text-ghMuted hidden sm:inline">${repo}</span>
        </div>
      </div>
      <span class="flex-shrink-0 text-xs font-mono bg-ghBlue/15 text-ghBlue px-2 py-0.5 rounded-full hidden sm:inline-block">${branch}</span>
      <span class="flex-shrink-0 text-xs text-ghMuted whitespace-nowrap">${time}</span>
    </div>`;
}

function featureCard(
  icon: string,
  colorClass: string,
  title: string,
  description: string,
): string {
  const bgMap: Record<string, string> = {
    ghYellow: "bg-ghYellow/15",
    ghBlue: "bg-ghBlue/15",
    ghGreen: "bg-ghGreen/15",
  };
  const textMap: Record<string, string> = {
    ghYellow: "text-ghYellow",
    ghBlue: "text-ghBlue",
    ghGreen: "text-ghGreen",
  };

  return `
    <div class="bg-ghCard border border-ghBorder rounded-gh p-6">
      <div class="w-12 h-12 ${bgMap[colorClass]} rounded-full flex items-center justify-center mb-4">
        <i class="${icon} text-lg ${textMap[colorClass]}"></i>
      </div>
      <h3 class="text-lg font-semibold text-ghText mb-2">${title}</h3>
      <p class="text-ghMuted leading-relaxed">${description}</p>
    </div>`;
}

function stepCard(
  num: string,
  icon: string,
  title: string,
  description: string,
): string {
  return `
    <div class="relative flex flex-col items-center text-center">
      <div class="w-12 h-12 bg-ghBlue/15 border-2 border-ghBlue rounded-full flex items-center justify-center mb-4 z-10 bg-ghBg">
        <span class="text-ghBlue font-bold text-lg">${num}</span>
      </div>
      <div class="w-10 h-10 bg-ghCard border border-ghBorder rounded-full flex items-center justify-center mb-3">
        <i class="${icon} text-ghMuted"></i>
      </div>
      <h3 class="text-lg font-semibold text-ghText mb-2">${title}</h3>
      <p class="text-ghMuted text-sm leading-relaxed max-w-xs">${description}</p>
    </div>`;
}
