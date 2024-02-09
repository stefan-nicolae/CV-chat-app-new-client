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
    let decoded = decodeBase64(base64str)
    return decoded.length/1024/1024
}

let globalInterlocutor, CLOSED, ID 
const URLkeywords = Array.from(new URLSearchParams(window.location.search).getAll('keywords'))[0].replaceAll(" ", '').split(",");
const chatID = Array.from(new URLSearchParams(window.location.search).getAll('chatID'))[0]

export default function Chat (props) {
    const enableDefaultMessages = (URLkeywords.includes("defaults"))
    const fileSizeLimit = 8 
    const scrollDelta = 500

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
    const chatEmpty = useRef()
    const lastRequestReceived = useRef()

    const lastINTERLOCUTOR = useRef()
    const scrollStore = useRef({})

    globalInterlocutor = props.INTERLOCUTOR
    CLOSED = globalInterlocutor ? (globalInterlocutor.toString().startsWith("closed") ? true : false) : undefined
    globalInterlocutor =  CLOSED ? parseFloat(globalInterlocutor.replace("closed", "")) : globalInterlocutor

    ID = props.MYID
    const resetScroll = (amount) => {
        scrollToBeReset.current = amount
        setState(Math.random())
    }
    
    const isItScrolledDown = () => {
        if(scroll.current <= scrollDelta) {
            setTimeout(() => {
                props.set_isItScrolledDown("true " + globalInterlocutor)
            }, 100)
        }
        else {
            setTimeout(() => {
                props.set_isItScrolledDown("false " + globalInterlocutor)
            }, 100)
        }
    }

    if(globalInterlocutor !== lastINTERLOCUTOR.current) {
        lastINTERLOCUTOR.current = globalInterlocutor
        if(scrollStore.current[globalInterlocutor] === undefined) scrollStore.current[globalInterlocutor] = 0 
        scrollToBeReset.current = scrollStore.current[globalInterlocutor] 

        messageArr.current = []
        key.current = 0
        defaultMessagesHaveRan.current = false
        loadDefaultMessages(messageArr.current, defaultMessagesHaveRan, enableDefaultMessages, key) //will only run once
        MessageStore.getMessages(globalInterlocutor).forEach(message => {
            if(typeof(message.message) === "object") {
                const messageElement = <MediaMessage scroll={scroll} resetScroll={resetScroll} message={message.message} file={message.message} me={message.me} key={key.current++} generateFileEmbed={generateFileEmbed} isClosed={message.isClosed}/>
                messageArr.current.push(messageElement) 

            } else {
                const messageElement = <TextMessage message={message.message} me={message.me} key={key.current++} isClosed={message.isClosed}/> 
                messageArr.current.push(messageElement) 
            }
        })
        setAlertFiles(<></>)
        isItScrolledDown()
    }

    if(props.MYID) Network.chatHasOpened()

    const messageScrolling = (target) => {
        scrollToBeReset.current = -1
        scroll.current = target.scrollHeight - target.scrollTop - target.clientHeight
        scrollStore.current[globalInterlocutor] = scroll.current
        isItScrolledDown()
    }   

    const sendMessage = (message, me, isText=true, request, senderID) => {
        if(!me) {
            if(props.blockList[senderID]) {
                Network.sendRequest({
                    "msgType": "BLOCKED",
                    "peerID": senderID,
                    "senderID": props.MYID 
                })
                return
            }

            Network.sendRequest({
                "msgType": "requestSucceeded",
                "peerID": senderID,
                "requestID": request.requestID
            })
        }
        
        if(me || senderID === globalInterlocutor) {
            lastScrollBeforeMessage.current = scroll.current 
            newMessage.current = isText ? 1 : 2
            
            const messageElement = isText ? 
            <TextMessage message={message} me={me} key={key.current++}/> : 
            <MediaMessage scroll={scroll} resetScroll={resetScroll} file={message} me={me} key={key.current++} generateFileEmbed={generateFileEmbed}/>//
            messageArr.current.push(messageElement) 
        }

        if(!isText && dataURISizeInMB(message.dataURI) > fileSizeLimit) return 
        const requestID = Math.random()
        MessageStore.storeMessage({message: message, requestID: requestID, me: me, isClosed: false}, me ? globalInterlocutor : senderID)
        
        if(me) {
            Network.sendRequest({
                "msgType": isText ? "textMessage" : "fileMessage",
                "message": message,
                "peerID": globalInterlocutor,
                "requestID": requestID,
                "senderID": props.MYID
            })
            const INTERLOCUTOR = globalInterlocutor
            Network.waitForRequestID(requestID, () => {
            }, () => {
                MessageStore.getMessageByRequestID(requestID, INTERLOCUTOR).isClosed = true
                lastINTERLOCUTOR.current = Math.random()
                props.addToAsidePrompt(<p className={Math.random()}>Message not sent in chat id {INTERLOCUTOR}</p>)
            })
        }
        setTimeout(()=>{
            props.setNewMSG(Math.random()) 
        }, 50)
    }

    const sendTextMessage = (message, me) => {
        sendMessage(message, me)
    }

    if(props.requestReceived !== lastRequestReceived.current) {
        lastRequestReceived.current = props.requestReceived 
        const request = props.requestReceived
        switch(request.msgType) { 
            case "fileMessage":
                sendMessage(request.message, false, false, request, request.senderID)
                break
            case "textMessage":
                sendMessage(request.message, false, true, request, request.senderID)
                break
        }   
    }

    const sendFiles = (files, clearAlert = () => {}) => {
        setAlertFiles(<></>)
        clearAlert()
        files.forEach(file => {
            sendMessage(file, true, false)
        })
    }

    const enterInput = event => {
        if(event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            const message = event.currentTarget.value 
            if(message.startsWith(" ") || message.startsWith("\n") || message == "" || message == undefined) return 
            event.currentTarget.value = ""
            sendTextMessage(message, true)
        }
    }

    const closeAlertFiles = () => {
        setAlertFiles(<></>)
    }

    useEffect(() => {
        props.handleFileDrop(chatMain.current, (e) => {
            const newDataURI = e.dataTransfer.getData("text/plain")
            let newTitle = e.dataTransfer.getData("title")
            newTitle = newTitle.slice(newTitle.lastIndexOf("/") + 1)
  
            fileArrToFileStructArr(e.dataTransfer.files, files => {
                if(newDataURI && newDataURI.length && newDataURI.startsWith("data:") && newTitle && newTitle.length && !newTitle.startsWith(" ")) files.push({fileName: newTitle, dataURI: newDataURI})
                files.forEach((file) => {
                    if(dataURISizeInMB(file.dataURI) > fileSizeLimit) {
                        files = []
                        return
                    }
                })
                if(files.length === 0) return
                const seed = Math.random() 
                if(!CLOSED) setAlertFiles(<AlertFiles CLOSED={CLOSED} closeAlertFiles={closeAlertFiles} files={files} handleFileDrop={props.handleFileDrop} seed={seed} sendFiles={sendFiles} generateFileEmbed={generateFileEmbed}/>)
            })
        })
        props.handleFileDrop(chatEmpty.current)
        
        if(newMessage.current && lastScrollBeforeMessage.current <= scrollDelta) {
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

    const sendForceAddMessage = (ID) => {
        Network.sendRequest({
            "msgType": "forceAdd",
            "senderID": ID,
            "chatID": chatID,
            "nickname": props.nickname
        })
    }
    
    useEffect(() => {
        const interval = setInterval(() => {
            if(ID) {
                sendForceAddMessage(ID)
                clearInterval(interval)
            }
        },1000)
    },[])

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
                <textarea onKeyDown={(event) => enterInput(event)} type="text"></textarea>
            </div>
        </div>
    ) : (
        <div className="chat chat-empty" ref={chatEmpty} data-identifier="5"></div>
    )
}