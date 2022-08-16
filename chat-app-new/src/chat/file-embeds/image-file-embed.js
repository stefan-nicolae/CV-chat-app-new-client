export default function ImageFileEmbed(props) {
    return(
        <img onClick={props.addFullscreen} onDoubleClick={event => event.preventDefault()} className="file-embed image-file-embed" src={props.dataURI}/>
    )
}