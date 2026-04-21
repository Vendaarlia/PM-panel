import { g as getMasterDb, p as projects, a as getNotesFromTenant, m as markProjectAsRead } from '../../chunks/turso-tenant_B4V9IFI0.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request, url }) => {
  try {
    const slug = url.searchParams.get("slug");
    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Project slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const masterDb = await getMasterDb();
    const projectResult = await masterDb.select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
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
    if (!project.tursoDbUrl || !project.tursoDbToken) {
      return new Response(
        JSON.stringify({
          error: "Tenant database not configured",
          message: `Project "${slug}" does not have a Turso database configured.`
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const notes = await getNotesFromTenant(slug);
    const isAdmin = request.headers.get("x-viewer-role") === "admin";
    if (isAdmin) {
      await markProjectAsRead(slug);
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          notes: notes.map((note) => ({
            id: note.id,
            content: note.content,
            authorRole: note.authorRole,
            authorName: note.authorName,
            attachmentUrl: note.attachmentUrl,
            attachmentType: note.attachmentType,
            attachmentName: note.attachmentName,
            createdAt: note.createdAt
          })),
          project: {
            id: project.id,
            name: project.name,
            slug: project.slug,
            status: project.status
          }
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-notes API:", error);
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      if (error.message.includes("does not have Turso database configured")) {
        return new Response(
          JSON.stringify({
            error: "Tenant database not configured",
            message: error.message
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve notes",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-viewer-role"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
