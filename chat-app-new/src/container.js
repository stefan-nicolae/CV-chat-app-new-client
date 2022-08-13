import { useState } from "react"
import Startup from "./startup"
import Chat from "./chat"
import Aside from "./aside"
import Network from "./network"
import "./main.css"

export default function Container () {
    const enableStartup = false
    const [nickname, setNickname] = useState(enableStartup ? undefined : "default")
    const [MYID, setMYID] = useState()
    const [newMSG, setNewMSG] = useState()
    return nickname ? (
        <div className="container container-main">
            <Aside MYID={MYID} nickname={nickname}/>
            <Chat MYID={MYID} newMSG={newMSG} setNewMSG={setNewMSG}/>
            <Network setMYID={setMYID}/>
        </div>
    ) : <div className="container">
            <Startup setNickname={setNickname}/>
        </div>
}