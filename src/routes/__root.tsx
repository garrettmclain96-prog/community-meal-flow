import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider, THEME_BOOT_SCRIPT } from "@/lib/theme";
import { DisplayProvider, DISPLAY_BOOT_SCRIPT } from "@/lib/display-settings";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-2xl border-2 border-foreground bg-card p-8 shadow-[10px_10px_0_var(--primary)] md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-primary">ProvisionLoop / 404</p>
        <h1 className="mt-5 font-display text-6xl font-black leading-[0.85] tracking-[-0.07em] md:text-8xl">
          THIS LOOP DOESN&apos;T EXIST.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
          The page moved, the link is stale, or this path was never part of the network. Nothing is lost — head back to the live system.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="button-primary">Return home</Link>
          <Link to="/help" className="button-secondary">Find food help</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-2xl border-2 border-foreground bg-card p-8 shadow-[10px_10px_0_var(--primary)] md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-primary">ProvisionLoop / recovery</p>
        <h1 className="mt-5 font-display text-5xl font-black leading-[0.9] tracking-[-0.06em] md:text-7xl">
          THE LOOP HIT A BREAK.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
          Something failed while loading this page. Retry the route first; if the problem persists, return to the network home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="button-primary"
          >
            Retry this page
          </button>
          <a href="/" className="button-secondary">Return home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "ProvisionLoop — Community Food Infrastructure" },
      {
        name: "description",
        content:
          "ProvisionLoop connects private food need, verified local kitchen capacity, accountable funding, volunteers and aggregate public proof across Galveston County.",
      },
      { name: "author", content: "ProvisionLoop · Founded by Garrett McLain" },
      { name: "theme-color", content: "#121210" },
      { property: "og:title", content: "ProvisionLoop — Community Food Infrastructure" },
      {
        property: "og:description",
        content:
          "Private need. Local capacity. Public accountability. ProvisionLoop is building a closed-loop local food network in Galveston County.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ProvisionLoop — Community Food Infrastructure" },
      {
        name: "twitter:description",
        content:
          "Private need. Local capacity. Public accountability. A closed-loop food network built to finish the job.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DisplayProvider>
          <AuthProvider>
            <main>
              <Outlet />
            </main>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </DisplayProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
