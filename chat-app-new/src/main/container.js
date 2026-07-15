import { useCallback, useState, useRef } from "react"
import Startup from "./startup"
import Chat from "../chat/chat"
import Aside from "../aside/aside"
import Network from "./network"
import "./main.css"
import { URLkeywords } from '../parameters.js';

const fileDropCleanups = new WeakMap()
function handleFileDrop (element, callback = () => {}) {
    if(!element) return () => {}

    fileDropCleanups.get(element)?.()
    const setDragging = active => {
        if(element.classList.contains("chat-main")) {
            element.classList.toggle("dragging", active)
        }
    }
    const handleDragOver = e => {
        e.preventDefault()
        setDragging(true)
    }
    const handleDragLeave = e => {
        e.preventDefault()
        setDragging(false)
    }
    const handleDrop = e => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(false)
        callback(e)
    }

    element.addEventListener("dragover", handleDragOver)
    element.addEventListener("dragleave", handleDragLeave)
    element.addEventListener("drop", handleDrop)

    const cleanup = () => {
        element.removeEventListener("dragover", handleDragOver)
        element.removeEventListener("dragleave", handleDragLeave)
        element.removeEventListener("drop", handleDrop)
        setDragging(false)
        fileDropCleanups.delete(element)
    }
    fileDropCleanups.set(element, cleanup)
    return cleanup
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

    const receiveRequest = useCallback((request) => {
        setRequestReceived(request)
    }, [])

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
