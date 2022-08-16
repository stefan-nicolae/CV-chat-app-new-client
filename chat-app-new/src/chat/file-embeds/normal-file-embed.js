function downloadBlob (blob, name = 'file.txt') {
    if(!blob) return
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    // Remove link from body
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
        console.log("File is completely empty.")
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