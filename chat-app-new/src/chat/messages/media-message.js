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
    
    return(<div className={className}>
        {props.file.fileType !== "file" ? 
        props.generateFileEmbed(props.file, () => addFullscreen(className, setClassName, props.scroll, props.resetScroll)) : 
        <NormalFileEmbed file={props.file}/>}
    </div>)
}