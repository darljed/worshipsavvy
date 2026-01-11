import { createInstance } from "@/lib/memoryStore";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const body = await req.json();
  // const id = nanoid();
  const id = "abc123"; // for testing purposes

  createInstance(id, body.data);
  console.log(body);

  return Response.json({ id });
}
