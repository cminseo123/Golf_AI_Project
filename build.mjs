// index.html 의 앱 스크립트를 빌드한다.
//   src/app.jsx  ->  assets/app.<hash>.js  (JSX 변환 + 압축)
// 파일명에 내용 해시를 넣는 이유: service-worker.js 가 .js 를 cacheFirst 로 잡아서
// 이름이 같으면 배포해도 옛 파일이 계속 나간다.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from 'node:fs';

mkdirSync('assets', { recursive: true });

let result;
try {
  result = await build({
    entryPoints: ['src/app.jsx'],
    bundle: false,
    minify: true,
    target: 'es2019',        // 구형 안드로이드 웹뷰까지 안전하게
    jsx: 'transform',        // React.createElement (UMD 전역 React 사용)
    charset: 'utf8',
    write: false,
    logLevel: 'warning',
  });
} catch {
  // esbuild 가 이미 파일·줄·열과 수정 힌트를 출력했다.
  // Node 스택 트레이스는 도움이 안 되므로 여기서 조용히 끝낸다.
  console.error('\n빌드 실패 — 위에 표시된 줄을 고친 뒤 다시 `npm run build` 를 실행하세요.');
  console.error('index.html 과 assets/ 는 건드리지 않았으므로 사이트는 그대로입니다.\n');
  process.exit(1);
}

const code = result.outputFiles[0].text;
const hash = createHash('sha256').update(code).digest('hex').slice(0, 8);
const filename = `app.${hash}.js`;

for (const f of readdirSync('assets')) {
  if (/^app\.[0-9a-f]{8}\.js$/.test(f) && f !== filename) unlinkSync(`assets/${f}`);
}
writeFileSync(`assets/${filename}`, code);

// index.html 의 스크립트 참조를 새 파일명으로 교체
const htmlPath = 'index.html';
let html = readFileSync(htmlPath, 'utf8');
const tagRe = /<script src="assets\/app\.[0-9a-f]{8}\.js" defer><\/script>/;
if (!tagRe.test(html)) {
  throw new Error('index.html 에서 앱 스크립트 태그를 찾지 못했습니다. 수동 확인 필요.');
}
html = html.replace(tagRe, `<script src="assets/${filename}" defer></script>`);
writeFileSync(htmlPath, html);

const srcKB = readFileSync('src/app.jsx').length / 1024;
console.log(`src/app.jsx  ${srcKB.toFixed(1)} KB  ->  assets/${filename}  ${(code.length/1024).toFixed(1)} KB`);
