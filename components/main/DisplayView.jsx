'use client'
import { useRef, useState, useLayoutEffect, useEffect } from "react"
import { mocklyrics } from "../../data/mockdata"

function DisplayView({content, height="h-75"}) {

    return (
        <div className={`flex flex-col justify-center items-center bg-black px-10 ${height}`}>
            <FitText text={content} maxFont={120} minFont={12} lineHeightFactor={1.1} />
        </div>
    )
}



// FitText: adjusts font size so the text fits on a single row inside its container.
// - Replaces whitespace/newlines with single spaces so the measurement is for a single-line layout
// - Uses binary search between minFont and maxFont to find the largest font that fits width and height
function FitText({ text = "", maxFont = 72, minFont = 12, lineHeightFactor = 1.05 }){
    const containerRef = useRef(null)
    const textRef = useRef(null)
    // hidden element used for measurement so visible text isn't painted until sized
    const measureRef = useRef(null)
    // start with minFont to avoid a large initial flash
    const [fontSize, setFontSize] = useState(minFont)
    const [measured, setMeasured] = useState(false)

    // Split by newlines; preserve each logical line but collapse internal whitespace
    const lines = (text || "").split(/\r?\n/).map(l => l.replace(/\s+/g, ' ').trim())
    const longestLine = lines.reduce((a, b) => ( (a || '').length >= (b || '').length ? a : b ), '')
    const numLines = Math.max(1, lines.length)

    const measure = () => {
        const container = containerRef.current
        const mEl = measureRef.current
        const vEl = textRef.current
        if (!container || !mEl || !vEl) return

        let low = minFont
        let high = maxFont
        let best = minFont

        // For measurement, test the longest line as a single no-wrap string on the hidden element
        mEl.style.display = 'inline-block'
        mEl.style.whiteSpace = 'nowrap'

        while (low <= high){
            const mid = Math.floor((low + high) / 2)
            mEl.style.fontSize = mid + 'px'
            mEl.style.lineHeight = '1'

            // width needed for the longest line at this font
            mEl.textContent = longestLine || ''
            const fitsWidth = mEl.scrollWidth <= container.clientWidth + 1

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

        // Apply best size and render full multi-line content into the visible element
        vEl.style.fontSize = best + 'px'
        vEl.style.lineHeight = String(lineHeightFactor)
        vEl.style.whiteSpace = 'pre-wrap'
        vEl.style.display = 'block'
        vEl.textContent = lines.join('\n')
        setFontSize(best)
        setMeasured(true)
    }

    useLayoutEffect(() => {
        setMeasured(false)
        measure()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text])

    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container) return
        const ro = new ResizeObserver(() => {
            setMeasured(false)
            measure()
        })
        ro.observe(container)
        window.addEventListener('resize', () => {
            setMeasured(false)
            measure()
        })
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div ref={containerRef} className="h-full w-full flex items-center justify-center relative">
            {/* hidden measurement element used during sizing */}
            <div ref={measureRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', padding: 0, margin: 0 }} />

            <div ref={textRef} className="text-white text-center" style={{ margin: 0, fontSize: fontSize, whiteSpace: 'pre-wrap', lineHeight: lineHeightFactor, visibility: measured ? 'visible' : 'hidden' }}>
                {measured ? lines.join('\n') : ''}
            </div>
        </div>
    )
}

export default DisplayView
