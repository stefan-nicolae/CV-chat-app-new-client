import { useEffect, useRef } from "react"
import { handleFileDrop } from "../../main/container"

export default function ImageFileEmbed(props) {
    const fileEmbed = useRef()
    useEffect(() => {
        handleFileDrop(fileEmbed.current)
    })

    return(
        <>
        <p className={"file-msg-p"}> {props.file.fileName}</p>
        <img ref={fileEmbed} onClick={props.addFullscreen} className="file-embed image-file-embed" src={props.file.dataURI}/>
        </>
    )
}