export default function AudioFileEmbed(props) {
    return(
        <>
            <p className={"file-msg-p"} >{props.file.fileName}</p>
            <audio className="file-embed audio-file-embed" controls>
                <source src={props.dataURI} type={props.embedFileType} />
                Your browser doesn't support the video tag.
            </audio>
        </>
    )
} 