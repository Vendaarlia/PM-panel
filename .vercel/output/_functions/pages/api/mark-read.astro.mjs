import { g as getMasterDb, p as projects, m as markProjectAsRead } from '../../chunks/turso-tenant_B4V9IFI0.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug } = body;
    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "Project slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const masterDb = await getMasterDb();
    const projectResult = await masterDb.select({
      id: projects.id,
      hasUnread: projects.hasUnread
    }).from(projects).where(eq(projects.slug, slug)).limit(1);
    if (projectResult.length === 0) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const project = projectResult[0];
    await markProjectAsRead(slug);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          slug,
          wasUnread: project.hasUnread,
          markedAsRead: true
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in mark-read API:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Failed to mark project as read",
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
