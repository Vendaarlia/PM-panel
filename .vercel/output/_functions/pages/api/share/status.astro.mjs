import { n as updateProjectStatusByShareToken } from '../../../chunks/query_DR9Y5sRj.mjs';
export { renderers } from '../../../renderers.mjs';

const PATCH = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, status } = body;
    if (!token || !status) {
      return new Response(
        JSON.stringify({ error: "Token and status are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!["draft", "review", "done"].includes(status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const project = await updateProjectStatusByShareToken(token, status);
    if (!project) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
