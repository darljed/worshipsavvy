'use client'
import { Image, MonitorCheck, Square, SquareDashed } from "lucide-react"
import {Button} from "../ui/button"
import { useRef, useState, useEffect } from "react"
import { mocklyrics } from "../../data/mockdata"
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
    return (
        // make this region take remaining vertical space and scroll internally
        <div className="w-full bg-gray-200 flex flex-col items-center px-2 gap-1 overflow-y-auto flex-1">
            {lyrics.map((lyric) => (
                <div 
                    key={lyric.id}
                    onClick={() => setSelectedId(lyric.id)}
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
                        <div className="h-full w-full flex items-center justify-center text-white p-6">
                            <FitText text={content.text} maxFont={72} minFont={12} />
                        </div>
                    )
                }
            </div>
        </div>
    )
}

// FitText: adjusts font size so the text fits on a single row inside its container.
// - Replaces whitespace/newlines with single spaces so the measurement is for a single-line layout
// - Uses binary search between minFont and maxFont to find the largest font that fits width and height
function FitText({ text = "", maxFont = 72, minFont = 12, lineHeightFactor = 1.05 }){
    const containerRef = useRef(null)
    const textRef = useRef(null)
    const [fontSize, setFontSize] = useState(maxFont)

    // Split by newlines; preserve each logical line but collapse internal whitespace
    const lines = (text || "").split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim())
    const longestLine = lines.reduce((a, b) => ( (a || '').length >= (b || '').length ? a : b ), '')
    const numLines = Math.max(1, lines.length)

    const measure = () => {
        const container = containerRef.current
        const el = textRef.current
        if (!container || !el) return

        let low = minFont
        let high = maxFont
        let best = minFont

        // For measurement, test the longest line as a single no-wrap string
        el.style.display = 'inline-block'
        el.style.whiteSpace = 'nowrap'

        while (low <= high){
            const mid = Math.floor((low + high) / 2)
            el.style.fontSize = mid + 'px'
            el.style.lineHeight = '1'

            // width needed for the longest line at this font
            el.textContent = longestLine || ''
            const fitsWidth = el.scrollWidth <= container.clientWidth + 1

            // height needed for all lines at this font size (approx using factor)
            const estimatedHeight = Math.ceil(numLines * mid * lineHeightFactor)
            const fitsHeight = estimatedHeight <= container.clientHeight + 1

            if (fitsWidth && fitsHeight){
                best = mid
                low = mid + 1
            } else {
                high = mid - 1
            }
        }

        // Apply best size and render full multi-line content
        el.style.fontSize = best + 'px'
        el.style.lineHeight = String(lineHeightFactor)
        el.style.whiteSpace = 'pre-wrap'
        el.style.display = 'block'
        el.textContent = lines.join('\n')
        setFontSize(best)
    }

    useEffect(() => {
        measure()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const ro = new ResizeObserver(() => measure())
        ro.observe(container)
        window.addEventListener('resize', measure)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div ref={containerRef} className="h-full w-full flex items-center justify-center">
            <div ref={textRef} className="text-white text-center" style={{ margin: 0, fontSize: fontSize, whiteSpace: 'pre-wrap', lineHeight: lineHeightFactor }}>
                {lines.join('\n')}
            </div>
        </div>
    )
}

export default LiveView
