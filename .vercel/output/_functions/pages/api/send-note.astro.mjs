import { g as getMasterDb, p as projects, c as createNoteInTenant } from '../../chunks/turso-tenant_B4V9IFI0.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      slug,
      content,
      authorName,
      authorRole = "client",
      attachmentUrl,
      attachmentType,
      attachmentName
    } = body;
    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Project slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Note content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!authorName || typeof authorName !== "string") {
      return new Response(
        JSON.stringify({ error: "Author name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (authorRole !== "admin" && authorRole !== "client") {
      return new Response(
        JSON.stringify({ error: 'Invalid authorRole. Must be "admin" or "client"' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const masterDb = await getMasterDb();
    const projectResult = await masterDb.select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      tursoDbUrl: projects.tursoDbUrl,
      tursoDbToken: projects.tursoDbToken
    }).from(projects).where(eq(projects.slug, slug)).limit(1);
    if (projectResult.length === 0) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const project = projectResult[0];
    if (authorRole === "client" && project.status === "draft") {
      return new Response(
        JSON.stringify({ error: "Project is not yet available" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const note = await createNoteInTenant(slug, {
      content: content.trim(),
      authorRole,
      authorName: authorName.trim(),
      attachmentUrl,
      attachmentType,
      attachmentName
    });
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          note: {
            id: note.id,
            content: note.content,
            authorRole: note.authorRole,
            authorName: note.authorName,
            createdAt: note.createdAt
          },
          project: {
            id: project.id,
            name: project.name
          }
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-note API:", error);
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      if (error.message.includes("not have Turso database configured")) {
        return new Response(
          JSON.stringify({
            error: "Tenant database not configured",
            details: error.message
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      if (error.message.includes("Invalid Turso database URL")) {
        return new Response(
          JSON.stringify({
            error: "Invalid database configuration",
            details: error.message
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    return new Response(
      JSON.stringify({
        error: "Failed to send note",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
