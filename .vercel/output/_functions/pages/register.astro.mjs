import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CPVj0fOm.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DJx0jIXn.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Register;
  const sessionCookie = Astro2.cookies.get("session");
  if (sessionCookie) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Register | Vendaar Admin", "data-astro-cid-qraosrxq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page" data-astro-cid-qraosrxq> <div class="auth-container" data-astro-cid-qraosrxq> <div class="brand" data-astro-cid-qraosrxq> <span class="logo" data-astro-cid-qraosrxq>Vendaar</span> <span class="divider" data-astro-cid-qraosrxq>|</span> <span class="portal-name" data-astro-cid-qraosrxq>Admin Register</span> </div> <form id="register-form" class="auth-form" data-astro-cid-qraosrxq> <div class="form-group" data-astro-cid-qraosrxq> <label for="name" data-astro-cid-qraosrxq>Full Name</label> <input type="text" id="name" name="name" required placeholder="Your Name" data-astro-cid-qraosrxq> </div> <div class="form-group" data-astro-cid-qraosrxq> <label for="email" data-astro-cid-qraosrxq>Email</label> <input type="email" id="email" name="email" required placeholder="your@email.com" data-astro-cid-qraosrxq> </div> <div class="form-group" data-astro-cid-qraosrxq> <label for="password" data-astro-cid-qraosrxq>Password</label> <input type="password" id="password" name="password" required placeholder="••••••••" minlength="6" data-astro-cid-qraosrxq> <small class="hint" data-astro-cid-qraosrxq>Minimum 6 characters</small> </div> <div id="error-message" class="error-message" data-astro-cid-qraosrxq></div> <div id="success-message" class="success-message" data-astro-cid-qraosrxq></div> <button type="submit" class="btn-primary" data-astro-cid-qraosrxq> <i class="fa-solid fa-user-plus" data-astro-cid-qraosrxq></i> Create Account
</button> </form> <p class="auth-footer" data-astro-cid-qraosrxq>
Already have an account? <a href="/login" data-astro-cid-qraosrxq>Sign In</a> </p> </div> </div> ` })} ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/register.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/register.astro", void 0);

const $$file = "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
