import { useEffect, useRef, useState } from "react"
import "./alert-files.css"

const imageFormats = ["jpg", "jpeg", "png", "gif"]
const videoFormats = ["mp4", "webm"]
const audioFormats = ["flac", "mp3", "wav", "ogg"]

function getFileType(file) {
    let fileType = undefined
    const dataURI = file.dataURI, fileName = file.fileName

    const testFormat = (type, formats) => {
        if(fileType !== undefined) return
        if(dataURI.startsWith("data:" + type)) {
            formats.forEach(format => {
                if(fileName.endsWith("." + format)) {
                    fileType = type
                    return
                }
            })
        }
    }

    testFormat("audio", audioFormats)
    testFormat("video", videoFormats)
    testFormat("image", imageFormats)
    if(fileType === undefined) fileType = "file"
    return fileType
}

function generateFileObject (file) {
    return {fileName: file.fileName, dataURI: file.dataURI, fileType: getFileType(file)}
}

function closeFile(event, files, setFiles, closeAlertFiles) {
    console.log("running")
    const key = event.target.parentElement.parentElement.dataset.key
    const filesNew = []
    for(let i = 0; i < files.length; i++) {
        if(i != key) filesNew.push(generateFileObject(files[i]))
    }
    if(!filesNew.length) closeAlertFiles()
    setFiles(filesNew)
}

function addFiles(files, propsFiles, setFiles) {
    const newFiles = []
    files.forEach(file => {
        newFiles.push(
            generateFileObject(file)
        )
    })
    propsFiles.forEach(file => {
        newFiles.push(
            generateFileObject(file)
        )
    })
    setFiles(newFiles)
}

export default function AlertFiles (props) {
    const [files, setFiles] = useState([])
    const alertFiles = useRef()
    const lastSeed = useRef()
    let key = 0

    if(props.seed !== lastSeed.current) {
        lastSeed.current = props.seed
        addFiles(files, props.files, setFiles)
    }

    useEffect(() => {
        props.handleFileDrop(alertFiles.current)
    }, [])
    return (
        <div className="alert-files" ref={alertFiles} data-identifier="4">
        {
            files.map(file => { 
                return (
                    <div data-key={key} key={key++} className="file">
                        <p><span className="close-file" onClick={(event => closeFile(event, files, setFiles, props.closeAlertFiles))}>✖</span>{" ..."+file.fileName.slice(-30)}</p>
                        {props.generateFileEmbed(file)}
                    </div>
                )
            })
        } 
        <button onClick={() => props.sendFiles(files, setFiles([]))} className="send-files">send</button>
        </div>
    )
}