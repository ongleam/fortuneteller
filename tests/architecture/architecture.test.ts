/**
 * 아키텍처 적합성 테스트 (ongleam 이식·적응).
 *
 *  - Structure: 모듈 top-level 디렉토리 화이트리스트 · index.ts 배럴 금지 · 테스트 위치
 *  - Dependency: 레이어 의존성 DAG (domain/shared leaf · app 은 modules 만 소비)
 *  - Manifest Honesty: 선언 안 한 @fortuneteller/* 패키지 import 금지
 *
 * 규칙(=데이터)은 이 파일에 직접 작성한다.
 */
import { describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  MODULES_SRC,
  REPO_ROOT,
  extractAllModuleImports,
  findLayerImportViolations,
  getAllTsFiles,
  getModules,
  getSourceTsFiles,
  type LayerType,
} from "./utils.ts";

const MODULE_ALLOWED_DIRS = ["domain", "application", "infra", "tests"];
// @principle — domain 은 ongleam DDD vocab 파일만 허용(타입·데이터·계약). 계산 로직·서비스는
// application 으로, 외부 I/O 는 infra 로 나간다. domain 은 이 7종 파일명 외 아무것도 두지 않는다.
const DOMAIN_ALLOWED_FILES = [
  "commands",
  "entities",
  "enums",
  "errors",
  "events",
  "ports",
  "value-objects",
];
// domain 루트 파일은 vocab 7종만. 도메인 서비스(계산 등 무상태 비즈니스 로직)는
// `services/` 서브폴더에 둔다(rich domain — anemic 방지). 그 외 서브디렉토리는 불허.
const DOMAIN_ALLOWED_DIRS = ["services"];
const MODULES = getModules();

// ==================== Structure ====================

describe("packages/modules — 구조", () => {
  for (const m of MODULES) {
    const moduleRoot = path.join(MODULES_SRC, m);
    describe(m, () => {
      it(`허용 디렉토리: ${MODULE_ALLOWED_DIRS.join(", ")}`, () => {
        const dirs = fs
          .readdirSync(moduleRoot, { withFileTypes: true })
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
        const bad = dirs.filter((d) => !MODULE_ALLOWED_DIRS.includes(d));
        expect(bad, `${m}/ 허용 안 된 디렉토리: ${bad.join(", ")}`).toEqual([]);
      });

      it("index.ts(배럴) 금지 — full subpath import 강제", () => {
        const bad = getAllTsFiles(moduleRoot)
          .filter((f) => path.basename(f) === "index.ts")
          .map((f) => path.relative(MODULES_SRC, f));
        expect(bad, `배럴 금지:\n${bad.join("\n")}`).toEqual([]);
      });

      it("*.test.ts 는 tests/ 하위에만", () => {
        const bad = getAllTsFiles(moduleRoot)
          .filter((f) => f.endsWith(".test.ts"))
          .filter((f) => !path.relative(moduleRoot, f).startsWith("tests/"))
          .map((f) => path.relative(MODULES_SRC, f));
        expect(bad, `tests/ 밖 테스트:\n${bad.join("\n")}`).toEqual([]);
      });

      it(`domain/ 루트는 ${DOMAIN_ALLOWED_FILES.join("·")}.ts + services/ 만 허용`, () => {
        const domainRoot = path.join(moduleRoot, "domain");
        if (!fs.existsSync(domainRoot)) return;
        const bad = fs
          .readdirSync(domainRoot, { withFileTypes: true })
          .filter((e) =>
            e.isFile()
              ? !DOMAIN_ALLOWED_FILES.includes(e.name.replace(/\.ts$/, ""))
              : !DOMAIN_ALLOWED_DIRS.includes(e.name),
          )
          .map((e) => e.name);
        expect(
          bad,
          `${m}/domain 에 허용 안 된 항목(도메인 서비스→services/, 외부 I/O→infra): ${bad.join(", ")}`,
        ).toEqual([]);
      });
    });
  }
});

// ==================== Dependency DAG ====================
//
// domain·shared 는 leaf. app 은 modules/* 만 소비하고 modules 는 app 을 모른다.
// config→shared · db→shared · infra→db 는 허용(disallow 에 없음).

const DAG: { from: LayerType; disallow: LayerType[] }[] = [
  {
    from: "module-domain",
    disallow: ["module-application", "module-infra", "pkg-db", "pkg-clients", "pkg-config", "app"],
  },
  { from: "module-application", disallow: ["app"] },
  {
    from: "pkg-shared",
    disallow: [
      "module-domain",
      "module-application",
      "module-infra",
      "pkg-db",
      "pkg-clients",
      "pkg-config",
      "app",
    ],
  },
  {
    from: "pkg-config",
    disallow: [
      "module-domain",
      "module-application",
      "module-infra",
      "pkg-db",
      "pkg-clients",
      "app",
    ],
  },
  {
    from: "pkg-db",
    disallow: [
      "module-domain",
      "module-application",
      "module-infra",
      "pkg-clients",
      "pkg-config",
      "app",
    ],
  },
  {
    from: "pkg-clients",
    disallow: ["module-domain", "module-application", "module-infra", "pkg-config", "app"],
  },
];

describe("레이어 의존성 DAG", () => {
  for (const { from, disallow } of DAG) {
    it(`${from} → ${disallow.join("·")} import 금지`, () => {
      const v = findLayerImportViolations(from, disallow);
      expect(
        v,
        v.length > 0
          ? `${from} 위반:\n${v.map((x) => `  - ${x.file}: ${x.importPath} (→ ${x.to})`).join("\n")}`
          : "",
      ).toEqual([]);
    });
  }
});

// ==================== Manifest Honesty ====================
//
// 각 워크스페이스 package.json 의 (peer)dependencies 가 SSOT —
// 선언 안 한 @fortuneteller/* 워크스페이스 패키지는 import 할 수 없다.

const NON_RUNTIME = [/\.(test|spec)\.(ts|tsx)$/, /(^|\/)tests\//, /\.config\.(ts|js|mjs|cjs)$/];

function workspaceRoots(): string[] {
  const roots = [
    path.join(REPO_ROOT, "apps/web"),
    ...["modules", "shared", "config", "db", "clients"].map((p) =>
      path.join(REPO_ROOT, "packages", p),
    ),
  ];
  return roots.filter((r) => fs.existsSync(path.join(r, "package.json")));
}

describe("Manifest Honesty", () => {
  for (const wsRoot of workspaceRoots()) {
    const name = path.relative(REPO_ROOT, wsRoot);
    it(`${name}: 선언 안 한 @fortuneteller/* import 금지`, () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(wsRoot, "package.json"), "utf-8")) as {
        name?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
      };
      const ft = (r?: Record<string, string>) =>
        Object.keys(r ?? {}).filter((n) => n.startsWith("@fortuneteller/"));
      const runtime = new Set([...ft(pkg.dependencies), ...ft(pkg.peerDependencies)]);
      const all = new Set([...runtime, ...ft(pkg.devDependencies)]);

      const violations: string[] = [];
      for (const file of getSourceTsFiles(wsRoot)) {
        const rel = path.relative(REPO_ROOT, file);
        const allowed = NON_RUNTIME.some((p) => p.test(rel)) ? all : runtime;
        for (const spec of extractAllModuleImports(file)) {
          const m = spec.match(/^(@fortuneteller\/[^/]+)/);
          if (m && m[1] !== pkg.name && !allowed.has(m[1]!)) {
            violations.push(`${rel}: ${spec}`);
          }
        }
      }
      expect(
        violations,
        violations.length > 0 ? `미선언 의존:\n${violations.join("\n")}` : "",
      ).toEqual([]);
    });
  }
});
