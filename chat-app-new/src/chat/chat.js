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
import * as MessageStore from "./message-store"

function generateFileEmbed (file, addFullscreen) {
    const getEmbedFileType = dataURI => {
        return(dataURI.slice(dataURI.indexOf(":")+1, dataURI.indexOf(";"))) 
    }
    switch(file.fileType) {
        case "audio":
            return(<AudioFileEmbed file={file} embedFileType={getEmbedFileType(file.dataURI)} />)      
        case "video":
            return(<VideoFileEmbed file={file} embedFileType={getEmbedFileType(file.dataURI)} />)
        case "image":
            return(<ImageFileEmbed file={file} embedFileType={getEmbedFileType(file.dataURI)} addFullscreen={addFullscreen}/>) 
        default:
            return(<></>)
    }
}

function loadDefaultMessages(messageArr, defaultMessagesHaveRan, enableDefaultMessages, key) {
    if(defaultMessagesHaveRan.current || !enableDefaultMessages) return
    defaultMessagesHaveRan.current = true
    for(let i = 0; i < 100; i++) {
        const me = (Math.random()>=0.5)
        const string = "a".repeat(1000)
        messageArr.push(<TextMessage message={string} me={me} key={key.current++}/>)
    }
}

function scrollDown (chatMain) {
    if(chatMain.current !== undefined)
        chatMain.current.scrollTop = chatMain.current.scrollHeight - chatMain.current.clientHeight
}

function setScroll (scroll, chatMain) {
    if(chatMain === undefined) return
    chatMain.current.scrollTop = chatMain.current.scrollHeight - chatMain.current.clientHeight - scroll.current
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

var decodeBase64 = function(s) {
    var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
    for(x=0;x<L;x++){
        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
    }
    return r;
};

function dataURISizeInMB (dataURI) {
    let base64str = dataURI.substr(22);
    // let decoded = atob(base64str);
    let decoded = decodeBase64(base64str)
    return decoded.length/1024/1024
}

let globalInterlocutor, CLOSED //sometimes a function can't read the current value, so we use this instead
export default function Chat (props) {
    const enableDefaultMessages = 1
    const fileSizeLimit = 8 //MB

    const [alertFiles, setAlertFiles] = useState()
    const [state, setState] = useState()
    const messageArr = useRef([])
    const scroll = useRef(0)
    const newMessage = useRef([false])
    const chatMain = useRef()
    const scrollToBeReset = useRef(0)
    const key = useRef(0)
    const defaultMessagesHaveRan = useRef(false)
    const lastScrollBeforeMessage = useRef()

    const lastINTERLOCUTOR = useRef()
    const scrollStore = useRef({})

    globalInterlocutor = props.INTERLOCUTOR
    CLOSED = globalInterlocutor ? (globalInterlocutor.toString().startsWith("closed") ? true : false) : undefined
    globalInterlocutor =  CLOSED ? parseFloat(globalInterlocutor.replace("closed", "")) : globalInterlocutor
    

    //ends up calling setScroll after the render
    const resetScroll = (amount) => {
        scrollToBeReset.current = amount
        setState(Math.random())
    }

    //on INTERLOCUTOR change
    if(globalInterlocutor !== lastINTERLOCUTOR.current) {
        lastINTERLOCUTOR.current = globalInterlocutor
        //reset scroll
        if(scrollStore.current[globalInterlocutor] === undefined) scrollStore.current[globalInterlocutor] = 0 
        scrollToBeReset.current = scrollStore.current[globalInterlocutor] 

        //load messages
        messageArr.current = []
        defaultMessagesHaveRan.current = false
        loadDefaultMessages(messageArr.current, defaultMessagesHaveRan, enableDefaultMessages, key) //will only run once
        MessageStore.getMessages(globalInterlocutor).forEach(message => {
            messageArr.current.push(message)
        })

        //clear any alert files
        setAlertFiles(<></>)
    }
    //

    if(props.MYID) Network.chatHasOpened()
    
    const messageScrolling = (target) => {
        scroll.current = target.scrollHeight - target.scrollTop - target.clientHeight
        scrollStore.current[globalInterlocutor] = scroll.current
    }   

    const sendTextMessage = (message, me) => {
        if(message.startsWith(" ") || message.startsWith("\n") || message === "") return
        lastScrollBeforeMessage.current = scroll.current
        const messageElement = <TextMessage message={message} me={me} key={key.current++}/>
        messageArr.current.push(messageElement) 
        newMessage.current = 1
        
        //store it 
        MessageStore.storeMessage(messageElement, globalInterlocutor)
        //send it over the network
        if(me) props.setNewMSG({
            me: true
        })
    }

    const sendFileMessages = (files, me) => {
        lastScrollBeforeMessage.current = scroll.current
        //print it
        files.forEach(file => {
            if(dataURISizeInMB(file.dataURI) > fileSizeLimit) return 
            const messageElement = <MediaMessage scroll={scroll} resetScroll={resetScroll} file={file} message={file.message} me={me} key={key.current++} generateFileEmbed={generateFileEmbed}/>
            messageArr.current.push(messageElement)
            MessageStore.storeMessage(messageElement, globalInterlocutor)
        })
        newMessage.current = 2
        
        //store it
        //send it over the network 
       if(me) props.setNewMSG({
            me: true
        })
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
                if(!CLOSED) setAlertFiles(<AlertFiles CLOSED={CLOSED} closeAlertFiles={closeAlertFiles} files={files} handleFileDrop={props.handleFileDrop} seed={seed} sendFiles={sendFiles} generateFileEmbed={generateFileEmbed}/>)
            })
        })
        
        if(newMessage.current && lastScrollBeforeMessage.current <= 500) {
            if(newMessage.current === 1) scrollDown(chatMain)
            if(newMessage.current === 2) setTimeout(() => {
                scrollDown(chatMain)
            }, 50)
            newMessage.current = 0
        }

        if(scrollToBeReset.current > 0) {
            setScroll(scrollToBeReset, chatMain)
        } else if (scrollToBeReset.current === 0 && chatMain.current) {
            scrollToBeReset.current = -1
            scrollDown(chatMain)
        }
    })
   
    return (props.MYID && globalInterlocutor !== undefined) ? (
        <div className="chat">
            <div className={"chat-main" + (CLOSED ? " chat-closed" : "")} onScroll={event => {messageScrolling(event.target)}} ref={chatMain} data-identifier="3">
                {messageArr.current.map(message => {
                    return(message) 
                })}
            </div>
            {alertFiles}
            <span className={"scroll-down" + (CLOSED ? " chat-closed": "")} onClick={() => scrollDown(chatMain)}><iconify-icon icon="ant-design:arrow-down-outlined"></iconify-icon> </span>
            <div className={"chat-input" + (CLOSED ? " chat-closed" : "")}>
                <textarea onKeyDown={enterInput} type="text"></textarea>
            </div>
        </div>
    ) : (
        <div className="chat"></div>
    )
}