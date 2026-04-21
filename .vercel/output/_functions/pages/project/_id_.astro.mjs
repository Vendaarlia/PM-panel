import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_CPVj0fOm.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_DJx0jIXn.mjs';
import { useSSRContext, defineComponent, ref, computed, onMounted, nextTick, mergeProps } from 'vue';
import { u as useGlobalToast } from '../../chunks/useGlobalToast_AtGYtyuO.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
/* empty css                                   */
import { _ as _export_sfc, T as ThemeToggle } from '../../chunks/ThemeToggle_D8b599eg.mjs';
import { f as getProjectById } from '../../chunks/query_DR9Y5sRj.mjs';
export { renderers } from '../../renderers.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminNotes",
  props: {
    projectId: {},
    slug: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const notes = ref([]);
    const newNote = ref("");
    const loading = ref(false);
    const notesLoading = ref(true);
    const chatContainer = ref();
    const currentUser = ref(null);
    const selectedFile = ref(null);
    const uploading = ref(false);
    const lightboxOpen = ref(false);
    const lightboxImage = ref("");
    const fileInput = ref();
    const markReadSuccess = ref(false);
    const toast = useGlobalToast();
    const sortedNotes = computed(() => {
      return [...notes.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    function linkifyText(text) {
      if (!text) return "";
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`);
    }
    function formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short"
      });
    }
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          currentUser.value = data.user;
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    async function fetchNotes() {
      notesLoading.value = true;
      try {
        const response = await fetch(`/api/notes?slug=${props.slug}`);
        if (!response.ok) throw new Error("Failed to fetch notes");
        notes.value = await response.json();
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        notesLoading.value = false;
      }
    }
    async function uploadFile() {
      if (!selectedFile.value) return null;
      uploading.value = true;
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (!response.ok) throw new Error("Failed to upload file");
        const data = await response.json();
        return { url: data.url, type: data.type, name: data.name };
      } catch (err) {
        console.error("Failed to upload file:", err);
        return null;
      } finally {
        uploading.value = false;
      }
    }
    function handleFileSelect(event) {
      const target = event.target;
      if (target.files && target.files[0]) {
        selectedFile.value = target.files[0];
      }
    }
    function clearFile() {
      selectedFile.value = null;
      if (fileInput.value) fileInput.value.value = "";
    }
    async function addNote() {
      if (!newNote.value.trim() && !selectedFile.value) return;
      const userName = currentUser.value?.name || "Admin";
      loading.value = true;
      try {
        let attachment = null;
        if (selectedFile.value) {
          attachment = await uploadFile();
        }
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: props.slug,
            content: newNote.value.trim() || (attachment ? `[File: ${attachment.name}]` : ""),
            authorRole: "admin",
            authorName: userName,
            attachment
          })
        });
        if (!response.ok) throw new Error("Failed to add note");
        newNote.value = "";
        clearFile();
        await fetchNotes();
        scrollToBottom();
      } catch (err) {
        console.error("Failed to add note:", err);
      } finally {
        loading.value = false;
      }
    }
    function scrollToBottom() {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    }
    function openLightbox(url) {
      lightboxImage.value = url;
      lightboxOpen.value = true;
    }
    function closeLightbox() {
      lightboxOpen.value = false;
      lightboxImage.value = "";
    }
    async function deleteNote(id) {
      if (!confirm("Delete this note?")) return;
      try {
        const response = await fetch(`/api/notes?id=${id}&slug=${props.slug}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete note");
        await fetchNotes();
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
    }
    async function markAsRead() {
      try {
        const response = await fetch(`/api/projects/${props.projectId}/mark-read`, {
          method: "POST"
        });
        if (!response.ok) throw new Error("Failed to mark as read");
        toast.success("Marked as read!", 2e3);
        setTimeout(() => {
          markReadSuccess.value = false;
        }, 2e3);
      } catch (err) {
        console.error("Failed to mark as read:", err);
        toast.error("Failed to mark as read. Please try again.", 3e3);
      }
    }
    onMounted(() => {
      fetchUser();
      fetchNotes();
    });
    const __returned__ = { props, notes, newNote, loading, notesLoading, chatContainer, currentUser, selectedFile, uploading, lightboxOpen, lightboxImage, fileInput, markReadSuccess, toast, sortedNotes, linkifyText, formatTime, fetchUser, fetchNotes, uploadFile, handleFileSelect, clearFile, addNote, scrollToBottom, openLightbox, closeLightbox, deleteNote, markAsRead };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-notes" }, _attrs))} data-v-dcf1267b><div class="notes-header" data-v-dcf1267b><h3 data-v-dcf1267b>Project Discussion</h3><div class="header-actions" data-v-dcf1267b><span class="admin-badge" data-v-dcf1267b>${ssrInterpolate($setup.currentUser?.name || "Admin")}</span><button class="${ssrRenderClass(["btn-mark-read", { "success": $setup.markReadSuccess }])}"${ssrRenderAttr("title", $setup.markReadSuccess ? "Marked as read!" : "Mark all messages as read")}${ssrIncludeBooleanAttr($setup.markReadSuccess) ? " disabled" : ""} data-v-dcf1267b><i class="${ssrRenderClass($setup.markReadSuccess ? "fa-solid fa-check" : "fa-solid fa-check-double")}" data-v-dcf1267b></i><span class="btn-text" data-v-dcf1267b>${ssrInterpolate($setup.markReadSuccess ? "Marked!" : "Mark as Read")}</span></button></div></div><div class="chat-container" data-v-dcf1267b>`);
  if ($setup.notesLoading) {
    _push(`<div class="loading" data-v-dcf1267b>Loading messages...</div>`);
  } else if ($setup.sortedNotes.length === 0) {
    _push(`<div class="empty" data-v-dcf1267b> No messages yet. Start the conversation! </div>`);
  } else {
    _push(`<div class="messages" data-v-dcf1267b><!--[-->`);
    ssrRenderList($setup.sortedNotes, (note) => {
      _push(`<div class="${ssrRenderClass(["message", note.authorRole === "admin" ? "admin" : "client"])}" data-v-dcf1267b><div class="message-bubble" data-v-dcf1267b><div class="message-header" data-v-dcf1267b><span class="author" data-v-dcf1267b>${ssrInterpolate(note.authorName || (note.authorRole === "admin" ? "Admin" : "Client"))}</span></div><p class="content" data-v-dcf1267b>${$setup.linkifyText(note.content) ?? ""}</p>`);
      if (note.attachmentUrl) {
        _push(`<div class="attachment" data-v-dcf1267b>`);
        if (note.attachmentType?.startsWith("image/")) {
          _push(`<div class="attachment-image-wrapper" data-v-dcf1267b><img${ssrRenderAttr("src", note.attachmentUrl)}${ssrRenderAttr("alt", note.attachmentName)} class="attachment-image" data-v-dcf1267b><a${ssrRenderAttr("href", note.attachmentUrl)} download class="btn-download" data-v-dcf1267b><i class="fa-solid fa-download" data-v-dcf1267b></i></a></div>`);
        } else {
          _push(`<a${ssrRenderAttr("href", note.attachmentUrl)} download class="attachment-file" data-v-dcf1267b><i class="fa-solid fa-paperclip" data-v-dcf1267b></i> ${ssrInterpolate(note.attachmentName)}</a>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<time class="timestamp" data-v-dcf1267b>${ssrInterpolate($setup.formatTime(note.createdAt))}</time>`);
      if (note.authorRole === "admin") {
        _push(`<button class="btn-delete" title="Delete" data-v-dcf1267b><i class="fa-solid fa-trash" data-v-dcf1267b></i></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    });
    _push(`<!--]--></div>`);
  }
  _push(`</div>`);
  if ($setup.lightboxOpen) {
    _push(`<div class="lightbox-overlay" data-v-dcf1267b><div class="lightbox-content" data-v-dcf1267b><button class="btn-close-lightbox" data-v-dcf1267b><i class="fa-solid fa-xmark" data-v-dcf1267b></i></button><img${ssrRenderAttr("src", $setup.lightboxImage)} alt="Full size" data-v-dcf1267b></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<form class="message-form" data-v-dcf1267b><div class="input-wrapper" data-v-dcf1267b><textarea placeholder="Type your message..." rows="2" data-v-dcf1267b>${ssrInterpolate($setup.newNote)}</textarea><input type="file" accept="image/*,.pdf,.txt,.zip" class="file-input" data-v-dcf1267b><button type="button" class="btn-attach"${ssrIncludeBooleanAttr($setup.uploading) ? " disabled" : ""} data-v-dcf1267b><i class="fa-solid fa-paperclip" data-v-dcf1267b></i></button><button type="submit"${ssrIncludeBooleanAttr(!$setup.newNote.trim() && !$setup.selectedFile || $setup.loading || $setup.uploading) ? " disabled" : ""} class="btn-send" data-v-dcf1267b><i class="fa-solid fa-paper-plane" data-v-dcf1267b></i></button></div>`);
  if ($setup.selectedFile) {
    _push(`<div class="file-preview" data-v-dcf1267b><span class="file-name" data-v-dcf1267b>${ssrInterpolate($setup.selectedFile.name)}</span><button type="button" class="btn-clear-file" data-v-dcf1267b><i class="fa-solid fa-xmark" data-v-dcf1267b></i></button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</form></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/AdminNotes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AdminNotes = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-dcf1267b"]]);

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const sessionCookie = Astro2.cookies.get("session");
  if (!sessionCookie) {
    return Astro2.redirect("/login");
  }
  const user = JSON.parse(sessionCookie.value);
  const { id } = Astro2.params;
  const projectId = Number(id);
  if (!id || isNaN(projectId)) {
    return Astro2.redirect("/");
  }
  const project = await getProjectById(projectId);
  if (!project) {
    return Astro2.redirect("/");
  }
  const statusLabels = {
    draft: "Draft",
    review: "Review",
    done: "Done"
  };
  const statusDescriptions = {
    draft: "Project is in preparation phase",
    review: "Project is ready for review",
    done: "Project has been completed"
  };
  const shareUrl = `${Astro2.url.origin}/share/${project.shareToken}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${project.name} | Client Handoff Dashboard`, "data-astro-cid-iejuj6pp": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="admin-portal" data-astro-cid-iejuj6pp> <div class="header-container" data-astro-cid-iejuj6pp> <header class="portal-header" data-astro-cid-iejuj6pp> <div class="brand" data-astro-cid-iejuj6pp> <span class="logo" data-astro-cid-iejuj6pp>Project Manager</span> <span class="divider" data-astro-cid-iejuj6pp>|</span> <span class="portal-name" data-astro-cid-iejuj6pp>Admin Dashboard</span> </div> <div class="header-actions" data-astro-cid-iejuj6pp> <span class="user-name" data-astro-cid-iejuj6pp>${user.name}</span> ${renderComponent($$result2, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ThemeToggle.vue", "client:component-export": "default", "data-astro-cid-iejuj6pp": true })} <button id="logout-btn" class="btn-logout" title="Logout" data-astro-cid-iejuj6pp> <i class="fa-solid fa-sign-out-alt" data-astro-cid-iejuj6pp></i> </button> </div> </header> </div> <main class="portal-content" data-astro-cid-iejuj6pp> <div class="project-card" data-astro-cid-iejuj6pp> <div class="project-header" data-astro-cid-iejuj6pp> <div class="project-meta" data-astro-cid-iejuj6pp> <span class="client-label" data-astro-cid-iejuj6pp>Client</span> <h1 class="project-name" data-astro-cid-iejuj6pp>${project.name}</h1> <p class="client-name" data-astro-cid-iejuj6pp>${project.client}</p> ${project.description && renderTemplate`<p class="project-description" data-astro-cid-iejuj6pp>${project.description}</p>`} </div> <div class="status-section" data-astro-cid-iejuj6pp> <span${addAttribute(`status-badge ${project.status}`, "class")} data-astro-cid-iejuj6pp> ${statusLabels[project.status]} </span> <p class="status-desc" data-astro-cid-iejuj6pp>${statusDescriptions[project.status]}</p> </div> </div> <div class="actions-section" data-astro-cid-iejuj6pp> <h3 data-astro-cid-iejuj6pp>Update Status</h3> <p class="action-hint" data-astro-cid-iejuj6pp>Click to change project status:</p> <div class="status-buttons" data-astro-cid-iejuj6pp> <button${addAttribute(`btn-status ${project.status === "draft" ? "active" : ""}`, "class")} data-status="draft"${addAttribute(project.id, "data-id")} data-astro-cid-iejuj6pp> <i class="fa-solid fa-pen-to-square" data-astro-cid-iejuj6pp></i> Draft
</button> <button${addAttribute(`btn-status ${project.status === "review" ? "active" : ""}`, "class")} data-status="review"${addAttribute(project.id, "data-id")} data-astro-cid-iejuj6pp> <i class="fa-solid fa-eye" data-astro-cid-iejuj6pp></i> Review
</button> <button${addAttribute(`btn-status ${project.status === "done" ? "active" : ""}`, "class")} data-status="done"${addAttribute(project.id, "data-id")} data-astro-cid-iejuj6pp> <i class="fa-solid fa-check-double" data-astro-cid-iejuj6pp></i> Done
</button> </div> </div> <div class="share-section" data-astro-cid-iejuj6pp> <h3 data-astro-cid-iejuj6pp>Secret Link</h3> <p class="share-hint" data-astro-cid-iejuj6pp>Send this link to client via WhatsApp:</p> <div class="share-link-box" data-astro-cid-iejuj6pp> <input type="text"${addAttribute(shareUrl, "value")} readonly id="admin-share-url" data-astro-cid-iejuj6pp> <button class="btn-copy" id="admin-copy-btn" data-astro-cid-iejuj6pp> <i class="fa-regular fa-copy" data-astro-cid-iejuj6pp></i>
Copy
</button> </div> </div> </div> <div class="discussion-card" data-astro-cid-iejuj6pp> ${renderComponent($$result2, "AdminNotes", AdminNotes, { "projectId": projectId, "slug": project.slug, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/AdminNotes.vue", "client:component-export": "default", "data-astro-cid-iejuj6pp": true })} </div> </main> <!-- Toast Container - client:only karena pakai Teleport --> ${renderComponent($$result2, "Toast", null, { "client:only": "vue", "position": "top-right", "client:component-hydration": "only", "data-astro-cid-iejuj6pp": true, "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/Toast.vue", "client:component-export": "default" })} <footer class="portal-footer" data-astro-cid-iejuj6pp> <p data-astro-cid-iejuj6pp>Powered by <strong data-astro-cid-iejuj6pp>Vendaar</strong> — Design-driven frontend partner</p> </footer> </div> ` })} ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/project/[id].astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/project/[id].astro?astro&type=script&index=1&lang.ts")} `;
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/project/[id].astro", void 0);

const $$file = "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/project/[id].astro";
const $$url = "/project/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
