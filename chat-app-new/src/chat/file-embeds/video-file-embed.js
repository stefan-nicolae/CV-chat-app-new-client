export default function VideoFileEmbed(props) {
    return(
        <>
            <p className={"file-msg-p"}>{props.file.fileName}</p>
            <video className="file-embed video-file-embed" controls>
                <source src={props.file.dataURI} type={props.embedFileType}/>
                Your browser doesn't support the video tag.
            </video>
        </>
    )
}