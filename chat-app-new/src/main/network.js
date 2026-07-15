import { useEffect } from "react"

const PRODUCTION = 0
let socket
const SERVER_URL1 = "vladolteanu.com/stfn/chat-app"
let MYID
let receivedRequestID

if(!PRODUCTION) socket = new WebSocket("ws://localhost:8082")
else {
        socket = new WebSocket("wss://" + SERVER_URL1)  
        setTimeout(() => {
            if(socket.readyState !== 1) {
                window.localStorage.setItem("secondserver", "set")
                window.location.reload()            
            }
        }, 1000)
}
    
export function chatHasOpened() {
    // Kept for compatibility with existing callers.
}

export function sendRequest(request) {
    if(socket.readyState !== WebSocket.OPEN) return false
    socket.send(JSON.stringify(request))
    return true
}

socket.addEventListener("open", () => {
    sendRequest({
        "message": "Hey"
    })
})

export function waitForRequestID(requestID, callback=()=>{}, errorCallback=()=>{}) {
    let requestWasReceived = false
    const interval2 = setInterval(() => {
        if(receivedRequestID === requestID) {
            clearInterval(interval2)
            requestWasReceived = true
            callback()
            receivedRequestID = undefined
        }
    }, 10)
    setTimeout(() => {
        clearInterval(interval2)
        if(!requestWasReceived) errorCallback()
    }, 15000)
}

export default function Network (props) {
    const { receiveRequest, setMYID } = props
    useEffect(() => {
        const handleMessage = data => {
            let msg
            try {
                msg = JSON.parse(data.data)
            } catch (error) {
                console.error("Ignored malformed WebSocket message", error)
                return
            }
            switch(msg.msgType) {
                case "yourID":
                    MYID = msg.ID
                    setMYID(MYID)
                    sendRequest({
                        "msgType": "MYID_RECEIVED",
                        "senderID": MYID
                    })
                    break    
                case "requestSucceeded": 
                    receivedRequestID = msg.requestID
                    break
                default: 
                    receiveRequest(msg)
                    break
            }
        }

        socket.addEventListener("message", handleMessage)
        return () => socket.removeEventListener("message", handleMessage)
    }, [receiveRequest, setMYID])
    return(<></>)
}
