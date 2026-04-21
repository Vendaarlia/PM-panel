import { useSSRContext, defineComponent, ref, onMounted, mergeProps } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
/* empty css                         */

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ThemeToggle",
  setup(__props, { expose: __expose }) {
    __expose();
    const currentTheme = ref("light");
    function getTheme() {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      currentTheme.value = theme;
    }
    function toggleTheme() {
      const newTheme = currentTheme.value === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    }
    onMounted(() => {
      applyTheme(getTheme());
    });
    const __returned__ = { currentTheme, getTheme, applyTheme, toggleTheme };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<button${ssrRenderAttrs(mergeProps({
    class: "theme-toggle",
    title: $setup.currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  }, _attrs))} data-v-0f06ebf8>`);
  if ($setup.currentTheme === "dark") {
    _push(`<i class="fa-solid fa-sun icon" data-v-0f06ebf8></i>`);
  } else {
    _push(`<i class="fa-solid fa-moon icon" data-v-0f06ebf8></i>`);
  }
  _push(`</button>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ThemeToggle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ThemeToggle = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-0f06ebf8"]]);

export { ThemeToggle as T, _export_sfc as _ };
