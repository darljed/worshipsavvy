import { getInstance } from "@/lib/memoryStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // In Next.js App Router dynamic API routes `params` may be a Promise.
  // Await `params` before accessing `id`.
  // Keep the runtime typing flexible here because Next passes a Promise-like params object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = await params;
  console.log({ id });

  const data = getInstance(id);

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(data);
}
