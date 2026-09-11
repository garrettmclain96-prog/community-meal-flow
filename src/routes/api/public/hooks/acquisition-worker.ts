import { createFileRoute } from "@tanstack/react-router";

// Scheduled hourly by Vercel Cron. Every caller must present a valid cron bearer
// token; see src/lib/acquisition-worker.server.ts.
async function handle(request: Request) {
  const { runAcquisitionWorker } = await import("@/lib/acquisition-worker.server");
  return runAcquisitionWorker(request);
}

export const Route = createFileRoute("/api/public/hooks/acquisition-worker")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
