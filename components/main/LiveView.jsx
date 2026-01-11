'use client'
import { Image, MonitorCheck, Square, SquareDashed } from "lucide-react"
import {Button} from "../ui/button"
import { useRef, useState, useLayoutEffect, useEffect } from "react"
import { mocklyrics } from "../../data/mockdata"
import DisplayView from "./DisplayView"
function LiveView() {
    const [ lyrics, setLyrics ] = useState(mocklyrics)
    const [ selectedId, setSelectedId ] = useState(null)
    return (
        <div className="flex flex-col h-screen">
            <LiveControls />
            <LiveDisplay lyrics={lyrics} selectedId={selectedId} />

            <LyricsControls lyrics={lyrics} selectedId={selectedId} setSelectedId={setSelectedId} />
        </div>
    )
}

function LyricsControls({ lyrics, selectedId, setSelectedId }){

    useEffect(() => {
        function updateView(){

            fetch('/api/memory/session/create',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ttl: 300,
                    data: lyrics.find(lyric => lyric.id === selectedId).text,
                }),
            })
        }

        if(lyrics.length > 0 && selectedId){
            updateView()
        }
    }, [selectedId, lyrics])


    return (
        // make this region take remaining vertical space and scroll internally
        <div className="w-full bg-gray-200 flex flex-col items-center px-2 gap-1 overflow-y-auto flex-1">
            {lyrics.map((lyric) => (
                <div 
                    key={lyric.id}
                    onClick={() => {
                        setSelectedId(lyric.id)
                    }}
                    className={`p-2 border-t w-full
                    ${selectedId === lyric.id ? "bg-blue-500 text-white" : ""}`}>
                    <span className="text-xs font-bold">{lyric.part}</span>
                    <pre
                    variant="outline"
                    className={`w-full text-wrap wrap-normal h-auto`}
                >
                    {lyric.text}
                </pre>
                </div>
            ))}
        </div>
    )
}

function LiveControls(){
    const isLive = true
    return (
        <div className="h-12 w-full bg-gray-200 flex justify-end items-center px-2 gap-1 ">
            <Button variant="outline"><Image size={12} aria-hidden={true} alt="" /></Button>
            <Button variant="outline"><Square size={12} aria-hidden={true} /></Button>
            <Button variant="outline"><SquareDashed size={12} aria-hidden={true} /></Button>
            <Button variant="outline" className={`${isLive ? "text-red-500 font-bold animate-pulse" : ""}`}>
                {isLive && <><MonitorCheck size={12} aria-hidden={true} /> Live</>}
            </Button>
        </div>)
}

function LiveDisplay({ lyrics, selectedId }){
    const content = lyrics.find(lyric => lyric.id === selectedId) || lyrics[0]

    return (
        <div className="bg-white py-2">
            <div className="aspect-video bg-black">
                {
                    content && (
                        <DisplayView content={content.text} />
                    )
                }
            </div>
        </div>
    )
}


export default LiveView
