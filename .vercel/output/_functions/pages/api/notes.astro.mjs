import { d as deleteNote, b as getNotesByProjectSlug, e as getNotesByProjectId, f as getProjectById, h as createNote } from '../../chunks/query_DR9Y5sRj.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const slug = searchParams.get("slug");
    if (!projectId && !slug) {
      return new Response(
        JSON.stringify({ error: "project_id or slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    let notes;
    if (slug) {
      notes = await getNotesByProjectSlug(slug);
    } else {
      notes = await getNotesByProjectId(Number(projectId));
    }
    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch notes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { projectId, slug, content } = body;
    if (!projectId && !slug || !content) {
      return new Response(
        JSON.stringify({ error: "projectId or slug, and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    let projectSlug = slug;
    if (!projectSlug && projectId) {
      const project = await getProjectById(Number(projectId));
      if (!project) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      projectSlug = project.slug;
    }
    const note = await createNote({
      slug: projectSlug,
      content,
      authorRole: body.authorRole || "admin",
      authorName: body.authorName || "Admin",
      attachmentUrl: body.attachment?.url,
      attachmentType: body.attachment?.type,
      attachmentName: body.attachment?.name
    });
    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create note" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Note ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Project slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await deleteNote(slug, Number(id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete note" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
