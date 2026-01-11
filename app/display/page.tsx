'use client'
import DisplayView from '@/components/main/DisplayView'
import { useEffect, useState } from 'react';

function Display() {
    const content: string = `I'm Trading my sorrow
I'm Trading my shame
I'm laying it down
For the joy of the Lord`

    const id = "abc123"; // for testing purposes
    const [events, setEvents] = useState<string[]>([]);

    useEffect(() => {
        const eventSource = new EventSource(`/api/memory/session/abc123/stream`);

        eventSource.onmessage = (event) => {
            // server sends simple text payloads; EventSource gives data as string
            const data = event.data;
            console.log("Received SSE data:", data);
            // append to events array
            setEvents((prev) => [...prev, data]);
            };

            eventSource.onerror = () => {
            console.error("SSE connection error");
            eventSource.close();
            };

            return () => {
            eventSource.close();
            };
        }, []);

        const latest = events.length > 0 ? events[events.length - 1] : content

        return (
            <div>
                <DisplayView content={latest} height="h-dvh"/>
            </div>
        )
    }

export default Display
