import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { readFile, readdir } from "node:fs/promises";

async function moduleFor(entry, plugin) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    plugins: [plugin],
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
}
const parser = await moduleFor("src/lib/design-docs.ts", {
  name: "server-only-wrapper",
  setup(b) {
    b.onResolve({ filter: /^@tanstack\/react-start$/ }, () => ({
      path: "start",
      namespace: "stub",
    }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: "export const createServerOnlyFn = fn => fn;",
    }));
  },
});

test("front matter, wrapped risks, completed questions, linked and missing ADRs", () => {
  const source =
    '---\r\ntitle: "Fixture"\r\npriority: p0\r\nstatus: draft\r\nlast_updated: 2026-09-06\r\n---\r\n# Fixture\r\n## Risks & Open Questions\r\n- [ ] First\r\n  continuation\r\n- [x] Done\r\n- Plain risk\r\n## Decisions\r\n[ADR](../../adr/one.md)\r\n[Missing](../../adr/missing.md)\r\n[External](https://example.com/adr/no.md)';
  const docs = parser.compileDesignDocs(
    { "docs/projects/x/design.md": source },
    { "docs/adr/one.md": "# Decision\n- Status: accepted" },
  );
  assert.equal(docs[0].title, "Fixture");
  assert.deepEqual(docs[0].questions, ["First continuation", "Plain risk"]);
  assert.deepEqual(
    docs[0].adrs.map((a) => a.status),
    ["accepted", "missing"],
  );
});

test("priority precedes status, status precedes date, deterministic ties and empty input", () => {
  const doc = (priority, status, date) =>
    `---\npriority: ${priority}\nstatus: ${status}\nlast_updated: ${date}\n---\n`;
  const result = parser.compileDesignDocs(
    {
      "c/design.md": doc("p1", "draft", "2026-09-06"),
      "b/design.md": doc("p0", "implemented", "2026-09-06"),
      "z/design.md": doc("p0", "draft", "2026-09-06"),
      "a/design.md": doc("p0", "draft", "2026-09-05"),
    },
    {},
  );
  assert.deepEqual(
    result.map((d) => d.path),
    ["z/design.md", "a/design.md", "b/design.md", "c/design.md"],
  );
  assert.deepEqual(parser.compileDesignDocs({}, {}), []);
  assert.deepEqual(parser.openQuestions("## Risks & Open Questions\n- Last risk"), ["Last risk"]);
});

const handlerModule = await moduleFor("src/lib/design.functions.ts", {
  name: "boundary-dependencies",
  setup(b) {
    b.onResolve(
      {
        filter:
          /^(?:@tanstack\/react-start(?:\/server)?|@\/integrations\/supabase\/auth-middleware|\.\/design-docs)$/,
      },
      (a) => ({ path: a.path, namespace: "stub" }),
    );
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({
      contents: a.path.endsWith("/server")
        ? "export const setResponseHeader = () => {};"
        : a.path.endsWith("auth-middleware")
          ? 'export const requireSupabaseAuth = "validated-session";'
          : a.path === "./design-docs"
            ? 'export const loadDesignDocs = () => [{title:"PRIVATE_SENTINEL"}];'
            : 'export const createServerFn = () => ({ middleware(m) { if(m[0] !== "validated-session") throw Error("Missing auth middleware"); return this; }, handler(fn) { return fn; } });',
    }));
  },
});

test("server denies non-admin and fails closed on RPC error; admin uses validated subject", async () => {
  const invoke = async (data, error = null) =>
    handlerModule.getDesignDashboard({
      context: {
        userId: "verified-subject",
        supabase: {
          rpc: async (name, args) => {
            assert.equal(name, "has_role");
            assert.deepEqual(args, { _user_id: "verified-subject", _role: "platform_admin" });
            return { data, error };
          },
        },
      },
    });
  assert.deepEqual(await invoke(false), { authorized: false, docs: [] });
  await assert.rejects(invoke(null, new Error("offline")), /Unable to verify/);
  assert.equal((await invoke(true)).docs[0].title, "PRIVATE_SENTINEL");
});

test("current repo doc metadata, risk extraction and ADR links", async () => {
  const source = await readFile("design.md", "utf8");
  const adrFiles = await readdir("docs/adr");
  const adrs = Object.fromEntries(
    await Promise.all(
      adrFiles.map(async (p) => [`docs/adr/${p}`, await readFile(`docs/adr/${p}`, "utf8")]),
    ),
  );
  const [doc] = parser.compileDesignDocs({ "design.md": source }, adrs);
  assert.equal(doc.priority, "p0");
  assert.ok(doc.questions.length >= 4);
  assert.equal(doc.adrs.length, 3);
  assert.ok(doc.adrs.every((a) => a.status === "accepted"));
  assert.ok((await readFile("CLAUDE.md", "utf8")).split("\n").length < 60);
});

test("built public assets never contain raw design prose or implementation", async () => {
  async function scan(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${item.name}`;
      if (item.isDirectory()) await scan(path);
      else if (/\.(?:js|mjs|map|html|md)$/.test(item.name)) {
        const content = await readFile(path, "utf8");
        for (const sentinel of [
          "The load-bearing design choice",
          "Markdown imported directly by a browser route",
          "compileDesignDocs",
        ])
          assert.ok(!content.includes(sentinel), `${path} leaks ${sentinel}`);
      }
    }
  }
  await scan(".output/public");
});
