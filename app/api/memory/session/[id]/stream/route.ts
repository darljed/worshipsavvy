// app/api/events/route.ts
import { getInstance } from "@/lib/memoryStore";
export const runtime = "nodejs"; // IMPORTANT (not edge)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) 
  {
  const { id } = await params;
  console.log({ id });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      let closed = false;

      // Use a self-scheduling timer to avoid overlapping ticks and races.
      let timer: ReturnType<typeof setTimeout> | null = null;

      // If the client aborts, stop scheduling and close the controller ASAP.
      const onAbort = () => {
        closed = true;
        try {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        } catch {}

        try {
          controller.close();
        } catch {}
      };

      // listen to the request signal for client disconnects
      if (request?.signal) {
        if (request.signal.aborted) {
          onAbort();
          return;
        }
        request.signal.addEventListener('abort', onAbort, { once: true });
      }

      const scheduleNext = (delay = 1000) => {
        if (closed || (request?.signal && request.signal.aborted)) return;
        timer = setTimeout(() => {
          // If aborted while waiting, bail out
          if (closed || (request?.signal && request.signal.aborted)) return;
          // run send and schedule the next tick only if still open
          sendTick();
        }, delay);
      };

      const sendTick = () => {
        if (closed || (request?.signal && request.signal.aborted)) return;

        // Use proper SSE framing: 'data: <payload>\n\n'

        const dataObject = getInstance(id);
        const data = dataObject ? dataObject : null;
        const payload = data || "";
        const sseChunk = `data: ${payload}`;

        try {
          controller.enqueue(encoder.encode(sseChunk));
          count++;
          // schedule next tick
          scheduleNext(1000);
        } catch (err) {
          // Stop sending on any enqueue error and close the controller safely.
          console.error('SSE stream enqueue failed:', err);
          closed = true;

          // stop future timer
          try {
            if (timer !== null) {
              clearTimeout(timer);
              timer = null;
            }
          } catch {}

          try {
            controller.close();
          } catch {}
        }
      };

      // Send immediately, then schedule the next tick.
      sendTick();

      // Cleanup on controller close (returned when the stream is canceled)
      return () => {
        try {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        } catch {}

        closed = true;
        try {
          controller.close();
        } catch {}

        if (request?.signal) {
          try {
            request.signal.removeEventListener('abort', onAbort);
          } catch {}
        }
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
