export default function AudioFileEmbed(props) {
    return(
        <audio className="file-embed audio-file-embed" controls>
            <source src={props.dataURI} type={props.embedFileType}/>
            Your browser doesn't support the video tag.
        </audio>
    )
} 