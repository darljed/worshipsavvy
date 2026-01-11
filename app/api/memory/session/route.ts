import { getAllInstances } from "@/lib/memoryStore";

export async function GET(req: Request) {
  const instances = getAllInstances();
  return Response.json(instances);
}