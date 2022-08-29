import { useEffect } from "react"

const ADDRESS = "ws://localhost:8082"
const socket = new WebSocket(ADDRESS)
let MYID
let interval 
let receivedRequestID

export function chatHasOpened() {
    clearInterval(interval)
}

export function sendRequest(request) {
    socket.send(JSON.stringify(request))
}

socket.addEventListener("open", () => {
    console.log("We are connected!")
    sendRequest({
        "message": "Hey"
    })
})


//this is to check if your message has been received by the other peer
export async function waitForRequestID(requestID) {
    //if it doesn't come within 10 seconds, return false, else return true :)
    setTimeout(() => {
        const interval = setInterval(() => {
            if(receivedRequestID === requestID) {
                clearInterval(interval)
                return true
            }
        }, 10)
    }, 10000)
    clearInterval(interval)
    return false
}

export default function Network (props) {
    useEffect(() => {
        interval = setInterval(() => {
            if(props.setMYID !== undefined) {
                props.setMYID(MYID)
            }
        }, 10)

        socket.addEventListener("message", data => {
            const msg = JSON.parse(data.data)
            console.log(msg)
            switch(msg.msgType) {
                case "yourID":
                    MYID = msg.ID
                    break    
                case "requestSucceeded": 
                    receivedRequestID = msg.requestID
                    break
                case "addPeer": 
                    props.receiveRequest(msg)
                    break
            }
        })
        
    }, [])
    return(<></>)
}