// Local static file server for Meridian app/ (Node 22+, standard library only).
// Usage: node serve.ts [--port 8080]

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const portFlag = process.argv.indexOf('--port');
const parsedPort = portFlag !== -1 ? Number(process.argv[portFlag + 1]) : 8080;
const port = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 8080;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const resolvedPath = resolve(join(appRoot, normalize(pathname)));
  if (resolvedPath !== appRoot && !resolvedPath.startsWith(appRoot + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let fileSize = 0;
  try {
    const info = statSync(resolvedPath);
    if (!info.isFile()) {
      res.writeHead(404).end('Not Found');
      return;
    }
    fileSize = info.size;
  } catch {
    res.writeHead(404).end('Not Found');
    return;
  }

  const contentType = CONTENT_TYPES[extname(resolvedPath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, {
    'content-type': contentType,
    'content-length': fileSize,
    'cache-control': 'no-store',
  });
  createReadStream(resolvedPath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Meridian app/ serving at http://127.0.0.1:${port}`);
});
