export default function VideoFileEmbed(props) {
    return(
        <video className="file-embed video-file-embed" controls>
            <source onDoubleClick={event => event.preventDefault()} src={props.dataURI} type={props.embedFileType}/>
            Your browser doesn't support the video tag.
        </video>
    )
}