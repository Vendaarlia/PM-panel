import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_CPVj0fOm.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_DJx0jIXn.mjs';
import { useSSRContext, defineComponent, ref, computed, onMounted, nextTick, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
/* empty css                                      */
import { _ as _export_sfc, T as ThemeToggle } from '../../chunks/ThemeToggle_D8b599eg.mjs';
import { l as getProjectByShareToken } from '../../chunks/query_DR9Y5sRj.mjs';
export { renderers } from '../../renderers.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ClientNotes",
  props: {
    shareToken: {}
  },
  setup(__props, { expose: __expose }) {
    __expose();
    const props = __props;
    const notes = ref([]);
    const newNote = ref("");
    const loading = ref(true);
    const showNameModal = ref(false);
    const clientName = ref("");
    const tempName = ref("");
    const chatContainer = ref();
    const selectedFile = ref(null);
    const uploading = ref(false);
    const fileInput = ref();
    const lightboxOpen = ref(false);
    const lightboxImage = ref("");
    const sortedNotes = computed(() => {
      return [...notes.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    function linkifyText(text) {
      if (!text) return "";
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`);
    }
    function formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short"
      });
    }
    function loadClientName() {
      const stored = localStorage.getItem(`client_name_${props.shareToken}`);
      if (stored) {
        clientName.value = stored;
      } else {
        showNameModal.value = true;
      }
    }
    function saveName() {
      if (tempName.value.trim()) {
        clientName.value = tempName.value.trim();
        localStorage.setItem(`client_name_${props.shareToken}`, clientName.value);
        showNameModal.value = false;
      }
    }
    function closeModal() {
      if (!clientName.value) return;
      showNameModal.value = false;
    }
    async function fetchNotes() {
      loading.value = true;
      try {
        const response = await fetch(`/api/share/notes?token=${props.shareToken}`);
        if (!response.ok) throw new Error("Failed to fetch notes");
        notes.value = await response.json();
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        loading.value = false;
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
      if (!newNote.value.trim() && !selectedFile.value || !clientName.value) return;
      loading.value = true;
      try {
        let attachment = null;
        if (selectedFile.value) {
          attachment = await uploadFile();
        }
        const response = await fetch("/api/share/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shareToken: props.shareToken,
            content: newNote.value.trim() || (attachment ? `[File: ${attachment.name}]` : ""),
            authorRole: "client",
            authorName: clientName.value,
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
      if (!confirm("Delete this message?")) return;
      try {
        const response = await fetch(`/api/share/notes?id=${id}&token=${props.shareToken}`, {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete note");
        await fetchNotes();
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
    }
    onMounted(() => {
      loadClientName();
      fetchNotes();
    });
    const __returned__ = { props, notes, newNote, loading, showNameModal, clientName, tempName, chatContainer, selectedFile, uploading, fileInput, lightboxOpen, lightboxImage, sortedNotes, linkifyText, formatTime, loadClientName, saveName, closeModal, fetchNotes, uploadFile, handleFileSelect, clearFile, addNote, scrollToBottom, openLightbox, closeLightbox, deleteNote };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "client-notes" }, _attrs))} data-v-d75b62df>`);
  if ($setup.showNameModal) {
    _push(`<div class="modal-overlay" data-v-d75b62df><div class="modal" data-v-d75b62df><h3 data-v-d75b62df>Welcome!</h3><p data-v-d75b62df>Enter your name to start collaboration.</p><form data-v-d75b62df><input${ssrRenderAttr("value", $setup.tempName)} type="text" placeholder="Your name" required autofocus data-v-d75b62df><button type="submit" class="btn-primary" data-v-d75b62df>Start</button></form></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="notes-header" data-v-d75b62df><h3 data-v-d75b62df>Project Discussion</h3><span class="client-badge" data-v-d75b62df>${ssrInterpolate($setup.clientName)}</span></div><div class="chat-container" data-v-d75b62df>`);
  if ($setup.loading) {
    _push(`<div class="loading" data-v-d75b62df>Loading messages...</div>`);
  } else if ($setup.notes.length === 0) {
    _push(`<div class="empty" data-v-d75b62df> No messages yet. Start the discussion now! </div>`);
  } else {
    _push(`<div class="messages" data-v-d75b62df><!--[-->`);
    ssrRenderList($setup.sortedNotes, (note) => {
      _push(`<div class="${ssrRenderClass(["message", note.authorRole === "admin" ? "admin" : "client"])}" data-v-d75b62df><div class="message-bubble" data-v-d75b62df><div class="message-header" data-v-d75b62df><span class="author" data-v-d75b62df>${ssrInterpolate(note.authorName || (note.authorRole === "client" ? "Client" : "Admin"))}</span></div><p class="content" data-v-d75b62df>${$setup.linkifyText(note.content) ?? ""}</p>`);
      if (note.attachmentUrl) {
        _push(`<div class="attachment" data-v-d75b62df>`);
        if (note.attachmentType?.startsWith("image/")) {
          _push(`<div class="attachment-image-wrapper" data-v-d75b62df><img${ssrRenderAttr("src", note.attachmentUrl)}${ssrRenderAttr("alt", note.attachmentName)} class="attachment-image" data-v-d75b62df><a${ssrRenderAttr("href", note.attachmentUrl)} download class="btn-download" data-v-d75b62df><i class="fa-solid fa-download" data-v-d75b62df></i></a></div>`);
        } else {
          _push(`<a${ssrRenderAttr("href", note.attachmentUrl)} download class="attachment-file" data-v-d75b62df><i class="fa-solid fa-paperclip" data-v-d75b62df></i> ${ssrInterpolate(note.attachmentName)}</a>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<time class="timestamp" data-v-d75b62df>${ssrInterpolate($setup.formatTime(note.createdAt))}</time>`);
      if (note.authorRole === "client") {
        _push(`<button class="btn-delete" title="Delete" data-v-d75b62df><i class="fa-solid fa-trash" data-v-d75b62df></i></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    });
    _push(`<!--]--></div>`);
  }
  _push(`</div><form class="message-form" data-v-d75b62df><div class="input-wrapper" data-v-d75b62df><textarea placeholder="Type your message..." rows="2" data-v-d75b62df>${ssrInterpolate($setup.newNote)}</textarea><input type="file" accept="image/*,.pdf,.txt,.zip" class="file-input" data-v-d75b62df><button type="button" class="btn-attach"${ssrIncludeBooleanAttr($setup.uploading) ? " disabled" : ""} data-v-d75b62df><i class="fa-solid fa-paperclip" data-v-d75b62df></i></button><button type="submit"${ssrIncludeBooleanAttr(!$setup.newNote.trim() && !$setup.selectedFile || $setup.loading || $setup.uploading) ? " disabled" : ""} class="btn-send" data-v-d75b62df><i class="fa-solid fa-paper-plane" data-v-d75b62df></i></button></div>`);
  if ($setup.selectedFile) {
    _push(`<div class="file-preview" data-v-d75b62df><span class="file-name" data-v-d75b62df>${ssrInterpolate($setup.selectedFile.name)}</span><button type="button" class="btn-clear-file" data-v-d75b62df><i class="fa-solid fa-xmark" data-v-d75b62df></i></button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</form>`);
  if ($setup.lightboxOpen) {
    _push(`<div class="lightbox-overlay" data-v-d75b62df><div class="lightbox-content" data-v-d75b62df><button class="btn-close-lightbox" data-v-d75b62df><i class="fa-solid fa-xmark" data-v-d75b62df></i></button><img${ssrRenderAttr("src", $setup.lightboxImage)} alt="Full size" data-v-d75b62df></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ClientNotes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ClientNotes = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d75b62df"]]);

const $$Astro = createAstro();
const $$token = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$token;
  const { token: shareToken } = Astro2.params;
  if (!shareToken) {
    return Astro2.redirect("/");
  }
  const project = await getProjectByShareToken(shareToken);
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
  const shareUrl = `${Astro2.url.origin}/share/${shareToken}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${project.name} | Vendaar Client Portal`, "data-astro-cid-723bru33": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="client-portal" data-astro-cid-723bru33> <div class="header-container" data-astro-cid-723bru33> <header class="portal-header" data-astro-cid-723bru33> <div class="brand" data-astro-cid-723bru33> <span class="logo" data-astro-cid-723bru33>Project Manager</span> <span class="divider" data-astro-cid-723bru33>|</span> <span class="portal-name" data-astro-cid-723bru33>Client Portal</span> </div> ${renderComponent($$result2, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ThemeToggle.vue", "client:component-export": "default", "data-astro-cid-723bru33": true })} </header> </div> <main class="portal-content" data-astro-cid-723bru33> <div class="project-card" data-astro-cid-723bru33> <div class="project-header" data-astro-cid-723bru33> <div class="project-meta" data-astro-cid-723bru33> <span class="client-label" data-astro-cid-723bru33>Client</span> <h1 class="project-name" data-astro-cid-723bru33>${project.name}</h1> <p class="client-name" data-astro-cid-723bru33>${project.client}</p> ${project.description && renderTemplate`<p class="project-description" data-astro-cid-723bru33>${project.description}</p>`} </div> <div class="status-section" data-astro-cid-723bru33> <span${addAttribute(`status-badge ${project.status}`, "class")} data-astro-cid-723bru33> ${statusLabels[project.status]} </span> <p class="status-desc" data-astro-cid-723bru33>${statusDescriptions[project.status]}</p> </div> </div> <div class="actions-section" data-astro-cid-723bru33> <h3 data-astro-cid-723bru33>Update Status</h3> <p class="action-hint" data-astro-cid-723bru33>Click to change project status:</p> <div class="status-buttons" data-astro-cid-723bru33> <button${addAttribute(`btn-status ${project.status === "draft" ? "active" : ""}`, "class")} data-status="draft"${addAttribute(shareToken, "data-token")} data-astro-cid-723bru33> <i class="fa-solid fa-pen-to-square" data-astro-cid-723bru33></i> Draft
</button> <button${addAttribute(`btn-status ${project.status === "review" ? "active" : ""}`, "class")} data-status="review"${addAttribute(shareToken, "data-token")} data-astro-cid-723bru33> <i class="fa-solid fa-eye" data-astro-cid-723bru33></i> Review
</button> <button${addAttribute(`btn-status ${project.status === "done" ? "active" : ""}`, "class")} data-status="done"${addAttribute(shareToken, "data-token")} data-astro-cid-723bru33> <i class="fa-solid fa-check-double" data-astro-cid-723bru33></i> Done
</button> </div> </div> <div class="share-section" data-astro-cid-723bru33> <h3 data-astro-cid-723bru33>Access Link</h3> <p class="share-hint" data-astro-cid-723bru33>Save this link to access the project anytime:</p> <div class="share-link-box" data-astro-cid-723bru33> <input type="text"${addAttribute(shareUrl, "value")} readonly id="share-url" data-astro-cid-723bru33> <button class="btn-copy" id="copy-btn" data-astro-cid-723bru33> <i class="fa-regular fa-copy" data-astro-cid-723bru33></i>
Copy
</button> </div> </div> </div> <div class="discussion-section" data-astro-cid-723bru33> ${renderComponent($$result2, "ClientNotes", ClientNotes, { "shareToken": shareToken, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/ClientNotes.vue", "client:component-export": "default", "data-astro-cid-723bru33": true })} </div> </main> <!-- Toast Container - client:only karena pakai Teleport --> ${renderComponent($$result2, "Toast", null, { "client:only": "vue", "position": "top-center", "client:component-hydration": "only", "data-astro-cid-723bru33": true, "client:component-path": "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/components/vue/Toast.vue", "client:component-export": "default" })} <footer class="portal-footer" data-astro-cid-723bru33> <p data-astro-cid-723bru33>Powered by <strong data-astro-cid-723bru33>Vendaar</strong> — Design-driven frontend partner</p> </footer> </div> ` })} ${renderScript($$result, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/share/[token].astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/share/[token].astro", void 0);

const $$file = "/Users/vendaarlia/Documents/LINKEDIN 2025/VENDAAR-TOPS/PORTFOLIO/bun/vue-js/src/pages/share/[token].astro";
const $$url = "/share/[token]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$token,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
