import { useEffect, useRef } from "react"

export default function ImageFileEmbed(props) {
    return(
        <>
        <p className={"file-msg-p"}> {props.file.fileName}</p>
        <img onClick={props.addFullscreen} className="file-embed image-file-embed" src={props.file.dataURI}/>
        </>
    )
}