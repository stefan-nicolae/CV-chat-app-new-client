import { useEffect, useState, useRef } from "react"
import Startup from "./startup"
import Chat from "../chat/chat"
import Aside from "../aside/aside"
import Network from "./network"
import "./main.css"
import { URLkeywords } from '../parameters.js';

const fileDropHandled = {}
function handleFileDrop (element, callback = () => {}) {
    if(element === null || element === undefined || element.dataset.identifier === undefined || fileDropHandled[element.dataset.identifier] === true) return
    fileDropHandled[element.dataset.identifier] = true
    element.ondragover = e => {
        e.preventDefault()
        if(element.className === "chat-main") {
            element.style.borderColor = "rgb(174, 181, 194)";
        }
    }
    element.ondragleave = e => {
        e.preventDefault()
        if(element.className === "chat-main") {
            element.style.borderColor = document.documentElement.style.getPropertyValue("--black")
        }
    }
    element.ondrop = e => {
        e.preventDefault()
        e.stopPropagation()
        if(element.className === "chat-main") {
            element.style.borderColor = document.documentElement.style.getPropertyValue("--black")
        }
        callback(e)
    }
}

export default function Container () {
    const enableStartup = (!URLkeywords.includes("defaults")) && (!URLkeywords.includes("nologin"))

    const blockList = useRef({})

    const [nickname, setNickname] = useState(enableStartup ? undefined : "user")
    const [MYID, setMYID] = useState()
    const [newMSG, setNewMSG] = useState()
    const [INTERLOCUTOR, setINTERLOCUTOR] = useState()
    const [requestReceived, setRequestReceived] = useState()
    const [asidePromptInformation, addToAsidePrompt] = useState() 
    const [isItScrolledDown, set_isItScrolledDown] = useState()

    useEffect(() => {
        document.querySelectorAll("*").forEach(component => {
            component.ondragstart = e => e.preventDefault()
        })

        const script = document.createElement('script');
        script.src = "https://code.iconify.design/iconify-icon/1.0.0-beta.3/iconify-icon.min.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
          document.body.removeChild(script);
        }
    }, [])

    const receiveRequest = (request) => {
        setRequestReceived(request)
    }

    return nickname ? (
        <div className="container container-main">
            <Network receiveRequest={receiveRequest} setMYID={setMYID} MYID={MYID}/>
            <Aside isItScrolledDown={isItScrolledDown} blockList={blockList} addToAsidePrompt={addToAsidePrompt} asidePromptInformation={asidePromptInformation} requestReceived={requestReceived} MYID={MYID} nickname={nickname} handleFileDrop={handleFileDrop} setINTERLOCUTOR={setINTERLOCUTOR} INTERLOCUTOR={INTERLOCUTOR}/>
            <Chat nickname={nickname} set_isItScrolledDown={set_isItScrolledDown} blockList={blockList} addToAsidePrompt={addToAsidePrompt} asidePromptInformation={asidePromptInformation} requestReceived={requestReceived} MYID={MYID} newMSG={newMSG} setNewMSG={setNewMSG} handleFileDrop={handleFileDrop} setINTERLOCUTOR={setINTERLOCUTOR} INTERLOCUTOR={INTERLOCUTOR}/>
        </div>
    ) : <div className="container"> 
            <Startup setNickname={setNickname} handleFileDrop={handleFileDrop}/>
        </div>
}