// 루트의 env 파일을 각 app(apps/*)으로 심링크한다.
// 모노레포 재편 이후 `next dev`는 apps/web 에서 실행되어 루트 .env* 를 읽지 못하므로,
// 루트를 SSOT로 두고 각 앱에 상대 심링크를 건다. 심링크는 .gitignore(.env*)로 무시된다.
import { existsSync, lstatSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const APPS_DIR = join(ROOT, "apps");

// 링크 대상 env 파일: .env, .env.local 등. 백업(.bak)은 제외한다.
const isEnvFile = (name: string) => /^\.env(\..+)?$/.test(name) && !name.endsWith(".bak");

const envFiles = readdirSync(ROOT).filter(isEnvFile);
if (envFiles.length === 0) {
  console.error("루트에 env 파일이 없습니다. 먼저 `/ongleam-setup`으로 env를 생성하세요.");
  process.exit(1);
}

const apps = readdirSync(APPS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const app of apps) {
  for (const envFile of envFiles) {
    const linkPath = join(APPS_DIR, app, envFile);
    const target = relative(join(APPS_DIR, app), join(ROOT, envFile));

    if (existsSync(linkPath) || lstatSync(linkPath, { throwIfNoEntry: false })) {
      rmSync(linkPath, { force: true });
    }
    symlinkSync(target, linkPath);
    console.log(`✓ apps/${app}/${envFile} -> ${target}`);
  }
}

console.log(`\n완료: ${apps.length}개 앱에 ${envFiles.length}개 env 파일 심링크`);
