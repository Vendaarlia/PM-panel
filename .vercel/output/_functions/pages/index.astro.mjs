import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CPVj0fOm.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DJx0jIXn.mjs';
import { useSSRContext, defineComponent, reactive, ref, mergeProps, onMounted, onUnmounted } from 'vue';
import { u as useGlobalToast } from '../chunks/useGlobalToast_AtGYtyuO.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
/* empty css                                 */
import { _ as _export_sfc, T as ThemeToggle } from '../chunks/ThemeToggle_D8b599eg.mjs';
export { renderers } from '../renderers.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProjectForm",
  emits: ["created"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const emit = __emit;
    const toast = useGlobalToast();
    const form = reactive({
      name: "",
      client: "",
      description: "",
      status: "draft"
    });
    const loading = ref(false);
    const error = ref("");
    async function handleSubmit() {
      loading.value = true;
      error.value = "";
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create project");
        }
        form.name = "";
        form.client = "";
        form.description = "";
        form.status = "draft";
        emit("created");
        window.dispatchEvent(new CustomEvent("project-created"));
        toast.success("Project created successfully!", 3e3);
      } catch (err) {
        error.value = err instanceof Error ? err.message : "An error occurred";
      } finally {
        loading.value = false;
      }
    }
    const __returned__ = { emit, toast, form, loading, error, handleSubmit };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<form${ssrRenderAttrs(mergeProps({ class: "project-form" }, _attrs))} data-v-882e3596><div class="form-group" data-v-882e3596><label for="name" data-v-882e3596>Project Name</label><input id="name"${ssrRenderAttr("value", $setup.form.name)} type="text" placeholder="Enter project name" required data-v-882e3596></div><div class="form-group" data-v-882e3596><label for="client" data-v-882e3596>Client</label><input id="client"${ssrRenderAttr("value", $setup.form.client)} type="text" placeholder="Enter client name" required data-v-882e3596></div><div class="form-group" data-v-882e3596><label for="description" data-v-882e3596>Description</label><textarea id="description" rows="3" placeholder="Enter project description" data-v-882e3596>${ssrInterpolate($setup.form.description)}</textarea></div><div class="form-group" data-v-882e3596><label for="status" data-v-882e3596>Status</label><select id="status" data-v-882e3596><option value="draft" data-v-882e3596${ssrIncludeBooleanAttr(Array.isArray($setup.form.status) ? ssrLooseContain($setup.form.status, "draft") : ssrLooseEqual($setup.form.status, "draft")) ? " selected" : ""}>Draft</option><option value="review" data-v-882e3596${ssrIncludeBooleanAttr(Array.isArray($setup.form.status) ? ssrLooseContain($setup.form.status, "review") : ssrLooseEqual($setup.form.status, "review")) ? " selected" : ""}>Review</option><option value="done" data-v-882e3596${ssrIncludeBooleanAttr(Array.isArray($setup.form.status) ? ssrLooseContain($setup.form.status, "done") : ssrLooseEqual($setup.form.status, "done")) ? " selected" : ""}>Done</option></select></div><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""} data-v-882e3596>${ssrInterpolate($setup.loading ? "Creating..." : "Create Project")}</button>`);
  if ($setup.error) {
    _push(`<p class="error" data-v-882e3596>${ssrInterpolate($setup.error)}</p>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</form>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ProjectForm.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ProjectForm = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-882e3596"]]);

const state = ref(null);
function useConfirm() {
  const confirm = (options) => {
    return new Promise((resolve) => {
      state.value = {
        ...options,
        title: options.title || "Confirm",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        type: options.type || "info",
        resolve,
        isOpen: true
      };
    });
  };
  const handleConfirm = () => {
    if (state.value) {
      state.value.resolve(true);
      state.value.isOpen = false;
      setTimeout(() => {
        state.value = null;
      }, 200);
    }
  };
  const handleCancel = () => {
    if (state.value) {
      state.value.resolve(false);
      state.value.isOpen = false;
      setTimeout(() => {
        state.value = null;
      }, 200);
    }
  };
  return {
    state,
    confirm,
    handleConfirm,
    handleCancel
  };
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProjectList",
  setup(__props, { expose: __expose }) {
    const projects = ref([]);
    const loading = ref(true);
    const error = ref("");
    const toast = useGlobalToast();
    const { confirm } = useConfirm();
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    async function fetchProjects() {
      loading.value = true;
      error.value = "";
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        projects.value = await response.json();
      } catch (err) {
        error.value = err instanceof Error ? err.message : "An error occurred";
      } finally {
        loading.value = false;
      }
    }
    async function deleteProject(id, projectName) {
      const confirmed = await confirm({
        title: "Delete Project",
        message: `Are you sure you want to delete "${projectName}" & all chat history?<br><br>This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger"
      });
      if (!confirmed) return;
      try {
        const response = await fetch(`/api/projects?id=${id}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete project");
        await fetchProjects();
        toast.success("Project deleted successfully", 2e3);
      } catch (err) {
        error.value = err instanceof Error ? err.message : "An error occurred";
        toast.error("Failed to delete project. Please try again.", 3e3);
      }
    }
    onMounted(() => {
      fetchProjects();
      window.addEventListener("project-created", fetchProjects);
    });
    onUnmounted(() => {
      window.removeEventListener("project-created", fetchProjects);
    });
    __expose({ refresh: fetchProjects });
    const __returned__ = { projects, loading, error, toast, confirm, formatDate, fetchProjects, deleteProject };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "project-list" }, _attrs))} data-v-ba13592b>`);
  if ($setup.loading) {
    _push(`<div class="loading" data-v-ba13592b>Loading projects...</div>`);
  } else if ($setup.error) {
    _push(`<div class="error" data-v-ba13592b>${ssrInterpolate($setup.error)}</div>`);
  } else if ($setup.projects.length === 0) {
    _push(`<div class="empty" data-v-ba13592b> No projects yet. Create one to get started. </div>`);
  } else {
    _push(`<div class="projects" data-v-ba13592b><!--[-->`);
    ssrRenderList($setup.projects, (project) => {
      _push(`<div class="project-card" data-v-ba13592b><div class="project-header" data-v-ba13592b><div class="project-header-left" data-v-ba13592b><div class="project-title-row" data-v-ba13592b><h3 data-v-ba13592b>${ssrInterpolate(project.name)}</h3>`);
      if (project.hasUnread) {
        _push(`<span class="unread-badge" title="New messages from client" data-v-ba13592b><i class="fa-solid fa-circle" data-v-ba13592b></i></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><time${ssrRenderAttr("datetime", project.lastActivityAt)}${ssrRenderAttr("title", "Last activity: " + $setup.formatDate(project.lastActivityAt))} data-v-ba13592b>${ssrInterpolate($setup.formatDate(project.lastActivityAt))}</time></div><span class="${ssrRenderClass(["status", project.status])}" data-v-ba13592b>${ssrInterpolate(project.status)}</span></div>`);
      if (project.description) {
        _push(`<p class="description" data-v-ba13592b>${ssrInterpolate(project.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="project-footer" data-v-ba13592b><p class="client" data-v-ba13592b>Client: ${ssrInterpolate(project.client)}</p><div class="actions" data-v-ba13592b><a${ssrRenderAttr("href", `/project/${project.id}`)} class="btn-link" data-v-ba13592b>View</a><button class="btn-delete" data-v-ba13592b> Delete </button></div></div></div>`);
    });
    _push(`<!--]--></div>`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ProjectList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ProjectList = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ba13592b"]]);

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const sessionCookie = Astro2.cookies.get("session");
  if (!sessionCookie) {
    return Astro2.redirect("/login");
  }
  const user = JSON.parse(sessionCookie.value);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Client Handoff Dashboard", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dashboard" data-astro-cid-j7pv25f6> <div class="header-container" data-astro-cid-j7pv25f6> <header class="portal-header" data-astro-cid-j7pv25f6> <div class="brand" data-astro-cid-j7pv25f6> <span class="logo" data-astro-cid-j7pv25f6>PM-panel</span> <span class="divider" data-astro-cid-j7pv25f6>|</span> <span class="portal-name" data-astro-cid-j7pv25f6>Admin Dashboard</span> </div> <div class="header-actions" data-astro-cid-j7pv25f6> <span class="user-name" data-astro-cid-j7pv25f6>${user.name}</span> ${renderComponent($$result2, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ThemeToggle.vue", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} <button id="logout-btn" class="btn-logout" title="Logout" data-astro-cid-j7pv25f6> <i class="fa-solid fa-sign-out-alt" data-astro-cid-j7pv25f6></i> </button> </div> </header> </div> <header class="page-header" data-astro-cid-j7pv25f6> <h1 data-astro-cid-j7pv25f6>Project Manager Dashboard</h1> <p class="subtitle" data-astro-cid-j7pv25f6>Manage your client projects efficiently</p> </header> <div class="dashboard-grid" data-astro-cid-j7pv25f6> <section class="form-section" data-astro-cid-j7pv25f6> <h2 data-astro-cid-j7pv25f6>Create Project</h2> ${renderComponent($$result2, "ProjectForm", ProjectForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ProjectForm.vue", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </section> <section class="list-section" data-astro-cid-j7pv25f6> <h2 data-astro-cid-j7pv25f6>All Projects</h2> ${renderComponent($$result2, "ProjectList", ProjectList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ProjectList.vue", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </section> </div> </div>  ${renderComponent($$result2, "Toast", null, { "client:only": "vue", "position": "top-right", "client:component-hydration": "only", "data-astro-cid-j7pv25f6": true, "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/Toast.vue", "client:component-export": "default" })} ` })}  ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/index.astro", void 0);

const $$file = "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
