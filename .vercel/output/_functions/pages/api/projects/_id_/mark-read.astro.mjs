import { f as getProjectById, m as markAsRead } from '../../../../chunks/query_DR9Y5sRj.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Project ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const project = await getProjectById(Number(id));
    if (!project) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    await markAsRead(project.slug);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    return new Response(JSON.stringify({ error: "Failed to mark as read" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
