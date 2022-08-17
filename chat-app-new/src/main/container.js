import { useEffect, useState } from "react"
import Startup from "./startup"
import Chat from "../chat/chat"
import Aside from "../aside/aside"
import Network from "./network"
import "./main.css"

const fileDropHandled = {}
//if callback is empty it will just stop file drops from doing anything
export function handleFileDrop (element, callback = () => {}) {
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

        const script = document.createElement('script');
        script.src = "https://code.iconify.design/iconify-icon/1.0.0-beta.3/iconify-icon.min.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
          document.body.removeChild(script);
        }
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