/** Build-time document parser. Imported only by the authenticated server handler. */
import { createServerOnlyFn } from "@tanstack/react-start";

export interface DesignDoc {
  path: string;
  title: string;
  domain: string;
  status: string;
  owner: string;
  priority: string;
  version: string;
  lastUpdated: string;
  questions: string[];
  adrs: { path: string; title: string; status: string; content: string }[];
}

// A deliberately small scalar front-matter subset; nested metadata remains in the source.
export function parseMarkdown(raw: string) {
  const text = raw.replace(/\r\n/g, "\n");
  const front = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const fields: Record<string, string> = {};
  for (const line of (front?.[1] ?? "").split("\n")) {
    const pair = line.match(/^([a-z_]+):\s*(.*?)\s*$/i);
    if (pair) fields[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  const body = front ? text.slice(front[0].length) : text;
  return { fields, body };
}

export function openQuestions(body: string): string[] {
  const section =
    body.match(/^## Risks & Open Questions\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] ?? "";
  const bullets: string[] = [];
  for (const line of section.split("\n")) {
    const bullet = line.match(/^[-*] (.*)/);
    if (bullet) bullets.push(bullet[1]);
    else if (/^\s+\S/.test(line) && bullets.length)
      bullets[bullets.length - 1] += ` ${line.trim()}`;
  }
  return bullets
    .filter((line) => !/^\[x\]/i.test(line))
    .map((line) => line.replace(/^\[ \]\s*/, ""));
}

function resolvePath(source: string, target: string): string | null {
  if (/^[a-z]+:|^\/\//i.test(target)) return null;
  const parts = target.startsWith("/") ? [] : source.split("/").slice(0, -1);
  for (const part of target.split("#")[0].split("/")) {
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else if (part && part !== ".") parts.push(part);
  }
  return parts.join("/");
}

export function compileDesignDocs(
  designs: Record<string, string>,
  adrs: Record<string, string>,
): DesignDoc[] {
  const docs = Object.entries(designs).map(([path, raw]) => {
    const { fields, body } = parseMarkdown(raw);
    const linked = new Set<string>();
    for (const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const resolved = resolvePath(path, match[1]);
      if (resolved && /(?:^|\/)adr\/.*\.md$/.test(resolved)) linked.add(resolved);
    }
    return {
      path,
      title: fields.title || body.match(/^# (.+)$/m)?.[1] || path,
      domain: fields.domain || "unspecified",
      status: fields.status || "draft",
      owner: fields.owner || "Unassigned",
      priority: fields.priority || "p3",
      version: fields.version || "Unversioned",
      lastUpdated: fields.last_updated || fields.date || "",
      questions: openQuestions(body),
      adrs: [...linked].map((adrPath) => {
        const content = adrs[adrPath];
        if (content === undefined)
          return {
            path: adrPath,
            title: adrPath,
            status: "missing",
            content: "Linked ADR is missing from this build.",
          };
        const adr = parseMarkdown(content);
        return {
          path: adrPath,
          title: adr.fields.title || adr.body.match(/^# (.+)$/m)?.[1] || adrPath,
          status: adr.fields.status || adr.body.match(/^- Status:\s*(.+)$/im)?.[1] || "unknown",
          content,
        };
      }),
    };
  });
  // Explicit, stable status order: unfinished decisions before implemented work.
  const statuses = [
    "draft",
    "proposed",
    "in_progress",
    "accepted",
    "implemented",
    "deprecated",
    "superseded",
    "archived",
  ];
  const rank = (status: string) => {
    const i = statuses.indexOf(status);
    return i < 0 ? statuses.length : i;
  };
  return docs.sort(
    (a, b) =>
      a.priority.localeCompare(b.priority) ||
      rank(a.status) - rank(b.status) ||
      a.status.localeCompare(b.status) ||
      b.lastUpdated.localeCompare(a.lastUpdated) ||
      a.path.localeCompare(b.path),
  );
}

export const loadDesignDocs = createServerOnlyFn(() => {
  const designs = import.meta.glob<string>(["/design.md", "/docs/projects/**/design.md"], {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const adrs = import.meta.glob<string>(["/docs/adr/**/*.md", "/docs/projects/**/adr/**/*.md"], {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const normalize = (files: Record<string, string>) =>
    Object.fromEntries(Object.entries(files).map(([path, raw]) => [path.replace(/^\//, ""), raw]));
  return compileDesignDocs(normalize(designs), normalize(adrs));
});
