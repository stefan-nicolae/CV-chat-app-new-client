//message format to send and receive over the network
// newMSG: {
//     me: true/false
//     message: text/object
//     isText: true/false
//     requestID: msg+Math.random() 
// }

import "./chat.css"
import TextMessage from "./messages/text-message"
import MediaMessage from "./messages/media-message"
import AlertFiles from "./alert-files"
import AudioFileEmbed from "./file-embeds/audio-file-embed"
import VideoFileEmbed from "./file-embeds/video-file-embed"
import ImageFileEmbed from "./file-embeds/image-file-embed"
import * as Network from "../main/network" 
import { useEffect, useRef, useState } from "react"

const enableDefaultMessages = false
let defaultMessagesHaveRan = false
function generateFileEmbed (file, addFullscreen) {
    const getEmbedFileType = dataURI => {
        return(dataURI.slice(dataURI.indexOf(":")+1, dataURI.indexOf(";"))) 
    }
    switch(file.fileType) {
        case "audio":
            return(<AudioFileEmbed dataURI={file.dataURI} embedFileType={getEmbedFileType(file.dataURI)}/>)      
        case "video":
            return(<VideoFileEmbed dataURI={file.dataURI} embedFileType={getEmbedFileType(file.dataURI)}/>)
        case "image":
            return(<ImageFileEmbed dataURI={file.dataURI} embedFileType={getEmbedFileType(file.dataURI)} addFullscreen={addFullscreen}/>) 
        default:
            return(<></>)
    }
}

function loadDefaultMessages(messageArr) {
    if(defaultMessagesHaveRan || !enableDefaultMessages) return
    defaultMessagesHaveRan = true
    for(let i = 0; i < 100; i++) {
        const identifier = (Math.random()>=0.5)? "me" : "them"
        const string = "a".repeat(1000)
        messageArr.push(identifier + string)
    }
}

function messageScrolling (event, scroll) {
    scroll.current = event.target.scrollHeight - event.target.scrollTop - event.target.clientHeight
}

function scrollDown (chatMain) {
    if(chatMain.current !== undefined)
        chatMain.current.scrollTop = chatMain.current.scrollHeight - chatMain.current.clientHeight
}

function blobToDataURI (blob, callback) {
    let a = new FileReader();
    a.onload = function (e) {
        callback(e.target.result);
    }
    a.readAsDataURL(blob);
}

function fileArrToFileStructArr (fileArr, callbackFn) {
    let list = []
    const f = (fileArr, i) => {
        if (fileArr.length === i) {
            callbackFn(list)
            return
        }
        blobToDataURI(fileArr[i], (dataURI) => {
            list.push({
                fileName: fileArr[i].name,
                dataURI: dataURI
            })
            f(fileArr, i + 1)
        })
    }
    f(fileArr, 0)
}
 
let key = 0;
export default function Chat (props) {
    const messageArr = useRef([])
    const scroll = useRef([])
    const newMessage = useRef([false])
    const chatMain = useRef()
    const [alertFiles, setAlertFiles] = useState()
    const [state, setState] = useState()

    if(props.MYID) Network.chatHasOpened()

    loadDefaultMessages(messageArr.current) //will only run once

    const sendTextMessage = (message, me) => {
        if(message.startsWith(" ") || message.startsWith("\n") || message === "") return
        messageArr.current.push(<TextMessage message={message} me={me} key={key++}/>) 
        newMessage.current = true

        //store it 
        //send it over the network
        if(me) props.setNewMSG({
            me: true
        })
    }

    const sendFileMessages = (files, me) => {
        //print it
        files.forEach(file => {
            messageArr.current.push(<MediaMessage scroll={scroll.current} resetScroll={resetScroll} file={file} message={file.message} me={me} key={key++} generateFileEmbed={generateFileEmbed}/>)
        })
       if(me) props.setNewMSG({
            me: true
        })
        //store it
        //send it over the network 
    }

    if(props.newMSG !== undefined && props.newMSG.me === false) {
        if(props.newMSG.isText) sendTextMessage(props.newMSG.message, false)
        else sendFileMessages([props.newMSG.message], false)
    }

    //calls sendFileMessages()
    const sendFiles = (files, clearAlert = () => {}) => {
        setAlertFiles(<></>)
        clearAlert()
        sendFileMessages(files, true)
    }

    const enterInput = event => {
        if(event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            const message = event.currentTarget.value 
            event.currentTarget.value = ""
            sendTextMessage(message, true)
        }
    }

    const closeAlertFiles = () => {
        setAlertFiles(<></>)
    }

    useEffect(() => {
        props.handleFileDrop(chatMain.current, e => {
            fileArrToFileStructArr(e.dataTransfer.files, files => {
                const seed = Math.random() //so AlertFiles knows when new files are dropped by comparing this seed with the last seed
                setAlertFiles(<AlertFiles closeAlertFiles={closeAlertFiles} files={files} handleFileDrop={props.handleFileDrop} seed={seed} sendFiles={sendFiles} generateFileEmbed={generateFileEmbed}/>)
            })
        })

        if(newMessage.current && scroll.current <= 500) {
            scrollDown(chatMain)
        }
    })
   
    return props.MYID ? (
        <div className="chat">
            <div className="chat-main" onScroll={event => {messageScrolling(event, scroll)}} onDoubleClick={() => {scrollDown(chatMain)}} ref={chatMain} data-identifier="3">
                {messageArr.current.map(message => {
                    return(message) 
                })}
            </div>
            {alertFiles}
            <div className="chat-input">
                <textarea onKeyDown={enterInput} type="text"></textarea>
            </div>
        </div>
    ) : (
        <div className="chat"></div>
    )
}