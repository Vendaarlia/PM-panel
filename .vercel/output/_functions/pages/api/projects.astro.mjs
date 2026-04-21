import { i as deleteProject, j as getAllProjects, u as updateProjectStatus, k as createProject } from '../../chunks/query_DR9Y5sRj.mjs';
import { getUniqueSlug } from '../../chunks/master-db_DH9oIfpH.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const projects = await getAllProjects();
    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, client, description, status = "draft" } = body;
    if (!name || !client) {
      return new Response(
        JSON.stringify({ error: "Name and client are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const existingProjects = await getAllProjects();
    const existingSlugs = existingProjects.map((p) => p.slug);
    const slug = getUniqueSlug(name, existingSlugs);
    const project = await createProject({
      name,
      slug,
      client,
      description,
      status
    });
    return new Response(JSON.stringify(project), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create project" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PATCH = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "ID and status are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const project = await updateProjectStatus(id, status);
    return new Response(JSON.stringify(project), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update project" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await deleteProject(Number(id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete project" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
