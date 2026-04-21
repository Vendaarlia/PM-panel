import { e as createComponent, r as renderTemplate, k as renderComponent, n as renderSlot, o as renderHead, h as createAstro } from './astro/server_CPVj0fOm.mjs';
import 'piccolore';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-theme="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="Project Manager Dashboard - Manage your client projects efficiently"><title>', `</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u{1F4CB}</text></svg>"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><script>
      (function() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      })();
    <\/script>`, "</head> <body> ", " <!-- Global Confirm Dialog --> ", " </body></html>"])), title, renderHead(), renderSlot($$result, $$slots["default"]), renderComponent($$result, "ConfirmDialog", null, { "client:only": "vue", "client:component-hydration": "only", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ConfirmDialog.vue", "client:component-export": "default" }));
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
