import NormalFileEmbed from "../file-embeds/normal-file-embed"
import {useState} from "react"


export default function MediaMessage (props) {
    const [className, setClassName] = useState(`message media-message ${props.me ? "me" : "them"}`)
    const addFullscreen = (className, setClassName, propsScrollCurrent, propsResetScrollFn) => {
        if(className.includes("fullscreen")) {
            setClassName(className.replace(" fullscreen", ""))
        }
        else setClassName(className+" fullscreen")
    }
    return(<div className={className}>
        {props.file.fileType !== "file" ? props.generateFileEmbed(props.file, () => addFullscreen(className, setClassName, props.scroll, props.resetScroll)) : <NormalFileEmbed file={props.file}/>}
    </div>)
}