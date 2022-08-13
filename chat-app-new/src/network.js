import { useEffect } from "react"

const ADDRESS = "ws://localhost:8082"
const socket = new WebSocket(ADDRESS)

export function sendRequest(request) {
    socket.send(JSON.stringify(request))
}

export default function Network (props) {
    useEffect(() => {
        socket.addEventListener("open", () => {
            console.log("We are connected!")
            socket.send("Hey")
        })
        socket.addEventListener("message", data => {
            const msg = JSON.parse(data.data)
            switch(msg.msgType) {
                case "yourID":
                    props.setMYID(msg.ID)
                    break    
            }
        })
    }, [])
    return(<></>)
}