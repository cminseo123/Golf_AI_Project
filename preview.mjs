// 로컬 미리보기 서버. Cloudflare Pages와 같은 규칙으로 서빙한다.
//   /about      -> about.html
//   /about.html -> /about 으로 308 리디렉션
//   없는 주소    -> 404.html
// 실행: npm run preview  (기본 포트 8000)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

const send = async (res, status, path) => {
  const body = await readFile(path);
  res.writeHead(status, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
  res.end(body);
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  // 배포 환경과 같이 .html 주소는 확장자 없는 주소로 넘긴다
  if (pathname.endsWith('.html') && pathname !== '/index.html') {
    res.writeHead(308, { Location: pathname.slice(0, -5) + url.search });
    return res.end();
  }
  if (pathname === '/index.html') {
    res.writeHead(308, { Location: '/' + url.search });
    return res.end();
  }

  const rel = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const target = join(ROOT, rel);

  for (const candidate of [
    pathname === '/' ? join(ROOT, 'index.html') : null,
    await isFile(target) ? target : null,
    join(ROOT, rel + '.html'),
    join(target, 'index.html'),
  ]) {
    if (candidate && (await isFile(candidate))) return send(res, 200, candidate);
  }

  const notFound = join(ROOT, '404.html');
  if (await isFile(notFound)) return send(res, 404, notFound);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
}).listen(PORT, () => {
  console.log(`미리보기: http://127.0.0.1:${PORT}  (끌 때 Ctrl+C)`);
});
