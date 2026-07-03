// 아키텍처 적합성 테스트 헬퍼 (ongleam tests/architecture 이식·적응).
// 순수 fs/정규식 — 무거운 의존성 0. @fortuneteller/* 레이어로 분류한다.
import * as fs from "node:fs";
import * as path from "node:path";

export const REPO_ROOT = path.join(import.meta.dir, "../..");
export const MODULES_SRC = path.join(REPO_ROOT, "packages/modules");

const PRUNED = new Set(["node_modules", "dist", ".turbo", ".next", "coverage"]);

export function getSourceTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (PRUNED.has(e.name)) continue;
      files.push(...getSourceTsFiles(path.join(dir, e.name)));
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

export function getAllTsFiles(dir: string): string[] {
  return getSourceTsFiles(dir);
}

/** import/from 스펙 전부 추출(bare·alias·상대). */
export function extractAllModuleImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const re = /from\s+["']([^"']+)["']/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) out.push(m[1]!);
  return out;
}

export function resolveRelativeImport(sourceFile: string, spec: string): string {
  return path.resolve(path.dirname(sourceFile), spec);
}

/** packages/modules 하위 도메인 모듈 목록. */
export function getModules(): string[] {
  if (!fs.existsSync(MODULES_SRC)) return [];
  return fs
    .readdirSync(MODULES_SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !PRUNED.has(e.name) && e.name !== "tests")
    .map((e) => e.name);
}

export type LayerType =
  | "module-domain"
  | "module-application"
  | "module-infra"
  | "pkg-shared"
  | "pkg-db"
  | "pkg-clients"
  | "pkg-config"
  | "app";

/** repo-root 상대 경로 → 레이어. 분류 불가(외부 등)는 null(규칙 미적용). */
export function classifyPathToLayer(repoRelPath: string): LayerType | null {
  const p = repoRelPath.replace(/\\/g, "/");
  const mod = p.match(/^packages\/modules\/[^/]+\/(domain|application|infra)\//);
  if (mod) return `module-${mod[1]}` as LayerType;
  if (p.startsWith("packages/shared/")) return "pkg-shared";
  if (p.startsWith("packages/db/")) return "pkg-db";
  if (p.startsWith("packages/clients/")) return "pkg-clients";
  if (p.startsWith("packages/config/")) return "pkg-config";
  if (/^apps\/[^/]+\//.test(p)) return "app";
  return null;
}

/** bare `@fortuneteller/*` 스펙 → 레이어. */
export function classifySpecifierToLayer(spec: string): LayerType | null {
  if (spec === "@fortuneteller/shared" || spec.startsWith("@fortuneteller/shared/"))
    return "pkg-shared";
  if (spec === "@fortuneteller/db" || spec.startsWith("@fortuneteller/db/")) return "pkg-db";
  if (spec === "@fortuneteller/clients" || spec.startsWith("@fortuneteller/clients/"))
    return "pkg-clients";
  if (spec === "@fortuneteller/config" || spec.startsWith("@fortuneteller/config/"))
    return "pkg-config";
  const mod = spec.match(/^@fortuneteller\/modules\/[^/]+\/(domain|application|infra)(\/|$)/);
  if (mod) return `module-${mod[1]}` as LayerType;
  return null;
}

export interface LayerImportViolation {
  file: string;
  importPath: string;
  to: LayerType;
}

/** fromLayer 소스에서 disallow 레이어를 import 하면 위반으로 수집(eslint-boundaries 의미론). */
export function findLayerImportViolations(
  fromLayer: LayerType,
  disallow: readonly LayerType[],
): LayerImportViolation[] {
  const roots = [path.join(REPO_ROOT, "packages"), path.join(REPO_ROOT, "apps")];
  const files = roots.flatMap((r) => getSourceTsFiles(r));
  const violations: LayerImportViolation[] = [];

  for (const file of files) {
    if (classifyPathToLayer(path.relative(REPO_ROOT, file)) !== fromLayer) continue;
    for (const spec of extractAllModuleImports(file)) {
      let to: LayerType | null = null;
      if (spec.startsWith(".")) {
        to = classifyPathToLayer(path.relative(REPO_ROOT, resolveRelativeImport(file, spec)));
      } else if (spec.startsWith("@fortuneteller/")) {
        to = classifySpecifierToLayer(spec);
      }
      if (to && disallow.includes(to)) {
        violations.push({ file: path.relative(REPO_ROOT, file), importPath: spec, to });
      }
    }
  }
  return violations;
}
