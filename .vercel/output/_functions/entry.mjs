import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D7dRuaxf.mjs';
import { manifest } from './manifest_DImet80A.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/logout.astro.mjs');
const _page3 = () => import('./pages/api/auth/me.astro.mjs');
const _page4 = () => import('./pages/api/auth/register.astro.mjs');
const _page5 = () => import('./pages/api/get-notes.astro.mjs');
const _page6 = () => import('./pages/api/mark-read.astro.mjs');
const _page7 = () => import('./pages/api/notes.astro.mjs');
const _page8 = () => import('./pages/api/projects/_id_/mark-read.astro.mjs');
const _page9 = () => import('./pages/api/projects.astro.mjs');
const _page10 = () => import('./pages/api/send-note.astro.mjs');
const _page11 = () => import('./pages/api/share/notes.astro.mjs');
const _page12 = () => import('./pages/api/share/status.astro.mjs');
const _page13 = () => import('./pages/api/upload.astro.mjs');
const _page14 = () => import('./pages/login.astro.mjs');
const _page15 = () => import('./pages/project/_id_.astro.mjs');
const _page16 = () => import('./pages/register.astro.mjs');
const _page17 = () => import('./pages/share/_token_.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/login.ts", _page1],
    ["src/pages/api/auth/logout.ts", _page2],
    ["src/pages/api/auth/me.ts", _page3],
    ["src/pages/api/auth/register.ts", _page4],
    ["src/pages/api/get-notes.ts", _page5],
    ["src/pages/api/mark-read.ts", _page6],
    ["src/pages/api/notes.ts", _page7],
    ["src/pages/api/projects/[id]/mark-read.ts", _page8],
    ["src/pages/api/projects.ts", _page9],
    ["src/pages/api/send-note.ts", _page10],
    ["src/pages/api/share/notes.ts", _page11],
    ["src/pages/api/share/status.ts", _page12],
    ["src/pages/api/upload.ts", _page13],
    ["src/pages/login.astro", _page14],
    ["src/pages/project/[id].astro", _page15],
    ["src/pages/register.astro", _page16],
    ["src/pages/share/[token].astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "3f21c0cc-a53e-4567-bdc6-87c6f63e7a54",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
