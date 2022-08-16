import { useEffect, useState } from "react"
import Startup from "./startup"
import Chat from "../chat/chat"
import Aside from "../aside/aside"
import Network from "./network"
import "./main.css"

const fileDropHandled = {}
function handleFileDrop (element, callback = () => {}) {
    if(element === undefined || element.dataset.identifier === undefined || fileDropHandled[element.dataset.identifier] === true) return
    fileDropHandled[element.dataset.identifier] = true
    element.ondragover = e => {
        e.preventDefault()
    }
    
    element.ondrop = e => {
        e.preventDefault()
        e.stopPropagation()
        callback(e)
    }
}

export default function Container () {
    const enableStartup = 0
    const [nickname, setNickname] = useState(enableStartup ? undefined : "default")
    const [MYID, setMYID] = useState()
    const [newMSG, setNewMSG] = useState()

    useEffect(() => {
        document.querySelectorAll("*").forEach(component => {
            component.ondragstart = e => e.preventDefault()
        })
    }, [])

    return nickname ? (
        <div className="container container-main">
            <Network setMYID={setMYID}/>
            <Aside MYID={MYID} nickname={nickname} handleFileDrop={handleFileDrop}/>
            <Chat MYID={MYID} newMSG={newMSG} setNewMSG={setNewMSG} handleFileDrop={handleFileDrop}/>
        </div>
    ) : <div className="container"> 
            <Startup setNickname={setNickname} handleFileDrop={handleFileDrop}/>
        </div>
}