// sitemap.xml 의 <lastmod> 를 각 페이지의 실제 최종 수정일로 갱신한다.
//   npm run sitemap
//
// 날짜 출처는 git 커밋일. 아직 커밋 안 한 수정이 있으면 오늘 날짜를 쓴다.
// 메인('/')은 index.html 과 src/app.jsx 중 더 최근 것을 따른다.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const today = new Date().toISOString().slice(0, 10);

const lastChanged = (file) => {
  try {
    const dirty = execSync(`git status --porcelain -- "${file}"`, { encoding: 'utf8' }).trim();
    if (dirty) return today;
    const d = execSync(`git log -1 --format=%cs -- "${file}"`, { encoding: 'utf8' }).trim();
    return d || today;
  } catch {
    return today;
  }
};

// https://thegolfcode.com/golf-grip-swing -> golf-grip-swing.html
const urlToFiles = (loc) => {
  const path = loc.replace(/^https?:\/\/[^/]+/, '');
  if (path === '/' || path === '') return ['index.html', 'src/app.jsx'];
  return [path.replace(/^\//, '') + '.html'];
};

let xml = readFileSync('sitemap.xml', 'utf8');
let updated = 0, missing = [];

xml = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) return block;
  const files = urlToFiles(loc);
  const dates = files.map(lastChanged).filter(Boolean).sort();
  const newest = dates[dates.length - 1];
  if (!newest) { missing.push(loc); return block; }
  return block.replace(/<lastmod>[^<]*<\/lastmod>/, () => {
    updated++;
    return `<lastmod>${newest}</lastmod>`;
  });
});

writeFileSync('sitemap.xml', xml);

const all = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]).sort();
console.log(`sitemap.xml: ${updated}개 갱신 (가장 오래된 ${all[0]} / 가장 최근 ${all[all.length - 1]})`);
if (missing.length) console.log('날짜를 못 찾은 주소:', missing.join(', '));
