import { useEffect } from "react"

const ADDRESS = "ws://localhost:8082"
const socket = new WebSocket(ADDRESS)
let MYID
let interval 

export function chatHasOpened() {
    clearInterval(interval)
}

socket.addEventListener("open", () => {
    console.log("We are connected!")
    socket.send("Hey")
})
socket.addEventListener("message", data => {
    const msg = JSON.parse(data.data)
    switch(msg.msgType) {
        case "yourID":
            MYID = msg.ID
            break    
    }
})

export function sendRequest(request) {
    socket.send(JSON.stringify(request))
}

export default function Network (props) {
    useEffect(() => {
        interval = setInterval(() => {
            if(props.setMYID !== undefined) {
                props.setMYID(MYID)
            }
        }, 10)
    }, [])
    return(<></>)
}