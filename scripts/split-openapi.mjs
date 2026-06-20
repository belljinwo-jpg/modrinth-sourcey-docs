import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import yaml from "js-yaml";

const source = yaml.load(await readFile("openapi.yaml", "utf8"));
const verbs = new Set(["get", "post", "put", "patch", "delete", "options", "head", "trace"]);
const aliases = new Map([
  ["versions", "versions"],
  ["version-files", "version-files"],
  ["users", "users"],
  ["notifications", "notifications"],
  ["threads", "threads"],
  ["teams", "teams"],
  ["tags", "tags"],
  ["misc", "misc"],
]);

const groups = ["projects-core", "projects-discovery", ...aliases.values()];

const groupedPaths = new Map(groups.map((group) => [group, {}]));
const operationCounts = Object.fromEntries(groups.map((group) => [group, 0]));
let projectOperationIndex = 0;

for (const [path, item] of Object.entries(source.paths ?? {})) {
  for (const [method, operation] of Object.entries(item ?? {})) {
    if (!verbs.has(method)) continue;
    const rawTag = String(operation.tags?.[0] ?? "misc").toLowerCase();
    const group = rawTag === "projects"
      ? (projectOperationIndex++ < 9 ? "projects-core" : "projects-discovery")
      : (aliases.get(rawTag) ?? "misc");
    const target = (groupedPaths.get(group)[path] ??= {});
    if (item.parameters) target.parameters = structuredClone(item.parameters);
    target[method] = structuredClone(operation);
    operationCounts[group] += 1;
  }
}

function getRefTarget(ref) {
  if (!ref.startsWith("#/")) return undefined;
  return ref
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, key) => value?.[key], source);
}

function collectRefs(value, refs) {
  if (!value || typeof value !== "object") return;
  if (typeof value.$ref === "string" && value.$ref.startsWith("#/components/")) refs.add(value.$ref);
  for (const child of Object.values(value)) collectRefs(child, refs);
}

function componentsFor(paths) {
  const refs = new Set();
  collectRefs(paths, refs);
  const queue = [...refs];
  for (let index = 0; index < queue.length; index += 1) {
    const before = refs.size;
    collectRefs(getRefTarget(queue[index]), refs);
    if (refs.size > before) queue.splice(queue.length, 0, ...[...refs].filter((ref) => !queue.includes(ref)));
  }

  const components = {};
  for (const ref of refs) {
    const [, , section, ...nameParts] = ref.split("/");
    const name = nameParts.join("/");
    const value = getRefTarget(ref);
    if (value === undefined) continue;
    (components[section] ??= {})[name] = structuredClone(value);
  }
  if (source.components?.securitySchemes) {
    components.securitySchemes = structuredClone(source.components.securitySchemes);
  }
  return components;
}

await rm("generated", { recursive: true, force: true });
await mkdir("generated", { recursive: true });

for (const [group, paths] of groupedPaths) {
  if (operationCounts[group] === 0) throw new Error(`OpenAPI group ${group} is empty`);
  const tags = [...new Set(Object.values(paths).flatMap((item) => Object.entries(item)
    .filter(([method]) => verbs.has(method))
    .flatMap(([, operation]) => operation.tags ?? [])))];
  const document = {
    openapi: source.openapi,
    info: source.info,
    servers: source.servers,
    security: source.security,
    tags: (source.tags ?? []).filter((tag) => tags.includes(tag.name)),
    paths,
    components: componentsFor(paths),
  };
  await writeFile(`generated/${group}.yaml`, yaml.dump(document, { lineWidth: -1, noRefs: true }));
}

await writeFile("generated/manifest.json", `${JSON.stringify({ operationCounts }, null, 2)}\n`);
