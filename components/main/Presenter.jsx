import LiveView from "./LiveView"
import MenuBar from "./MenuBar"

function Presenter() {
    return (
        <div className="">
            <div className="flex md:grid md:grid-cols-3">
                <div className="md:col-span-1 hidden md:block h-dvh bg-gray-100">1</div>
                <div className="md:col-span-1 hidden lg:block h-dvh bg-gray-50">2</div>
                <div className="md:col-span-2 lg:col-span-1 h-dvh bg-white">
                    <LiveView />
                </div>
            </div>
        </div>
    )
}

export default Presenter
