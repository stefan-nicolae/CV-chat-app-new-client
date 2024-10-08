import NormalFileEmbed from "../file-embeds/normal-file-embed"
import {useState,useRef} from "react"


export default function MediaMessage (props) {
    const [className, setClassName] = useState(`message media-message ${props.me ? "me" : "them"}`)
    const lastScroll = useRef()

    if(props.isClosed && !className.includes("msgClosed")) {
        setClassName(className + " msgClosed")
    }

    const addFullscreen = (className, setClassName, propsScrollCurrent, propsResetScrollFn) => {
        if(className.includes("fullscreen")) {
            setClassName(className.replace(" fullscreen", ""))
            propsResetScrollFn(lastScroll.current)
        }
        else {
            lastScroll.current = propsScrollCurrent.current
            setClassName(className+" fullscreen")
        }
    }
    
    return(<div className={className} onClick={
        () => props.file.fileType === "image" ?  addFullscreen(className, setClassName, props.scroll, props.resetScroll)  : {} //addFullscreen Here, only if file type is image
    }>
        {props.file.fileType !== "file" ? 
        props.generateFileEmbed(props.file, className) : 
        <NormalFileEmbed file={props.file}/>}
    </div>)
}