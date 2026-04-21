import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CPVj0fOm.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DJx0jIXn.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const sessionCookie = Astro2.cookies.get("session");
  if (sessionCookie) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login | Vendaar Admin", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-page" data-astro-cid-sgpqyurt> <div class="auth-container" data-astro-cid-sgpqyurt> <div class="brand" data-astro-cid-sgpqyurt> <span class="logo" data-astro-cid-sgpqyurt>Vendaar</span> <span class="divider" data-astro-cid-sgpqyurt>|</span> <span class="portal-name" data-astro-cid-sgpqyurt>Admin Login</span> </div> <form id="login-form" class="auth-form" data-astro-cid-sgpqyurt> <div class="form-group" data-astro-cid-sgpqyurt> <label for="email" data-astro-cid-sgpqyurt>Email</label> <input type="email" id="email" name="email" required placeholder="your@email.com" data-astro-cid-sgpqyurt> </div> <div class="form-group" data-astro-cid-sgpqyurt> <label for="password" data-astro-cid-sgpqyurt>Password</label> <input type="password" id="password" name="password" required placeholder="••••••••" minlength="6" data-astro-cid-sgpqyurt> </div> <div id="error-message" class="error-message" data-astro-cid-sgpqyurt></div> <button type="submit" class="btn-primary" data-astro-cid-sgpqyurt> <i class="fa-solid fa-sign-in-alt" data-astro-cid-sgpqyurt></i> Sign In
</button> </form> <p class="auth-footer" data-astro-cid-sgpqyurt>
Don't have an account? <a href="/register" data-astro-cid-sgpqyurt>Register</a> </p> </div> </div> ` })} ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/login.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/login.astro", void 0);

const $$file = "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
