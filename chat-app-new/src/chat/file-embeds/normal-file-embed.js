function downloadBlob (blob, name = 'file.txt') {
    if(!blob) return
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );
    document.body.removeChild(link);
}

function dataURItoBlob (dataURI) {
    try {
        let arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    }
    catch {
        return
    }
}

export default function NormalFileEmbed(props) {
    const downloadFile = () => {
        const dataURI = props.file.dataURI
        const blob = dataURItoBlob(dataURI)
        downloadBlob(blob, props.file.fileName)
    }
    return(
        <div className="file-embed normal-file-embed" onDoubleClick={downloadFile}>{props.file.fileName}</div>
    )
}