import DisplayView from '@/components/main/DisplayView'


function Display() {
    const content = `I'm Trading my sorrow
I'm Trading my shame
I'm laying it down
For the joy of the Lord`

    return (
        <div>
            <DisplayView content={content} height="h-dvh"/>
        </div>
    )
}

export default Display
