import { useEffect } from "react"

const PRODUCTION = 0
let socket
const SERVER_URL1 = "vladolteanu.com/stfn/chat-app"
let MYID
let interval 
let receivedRequestID

if(!PRODUCTION) socket = new WebSocket("ws://" + "localhost:8082")
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
    clearInterval(interval)
}

export function sendRequest(request) {
    socket.send(JSON.stringify(request))
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
    useEffect(() => {
        interval = setInterval(() => {
            if(MYID !== undefined) {
                props.setMYID(MYID)
            }
        }, 10)

        socket.addEventListener("message", data => {
            const msg = JSON.parse(data.data)
            switch(msg.msgType) {
                case "yourID":
                    MYID = msg.ID
                    sendRequest({
                        "msgType": "MYID_RECEIVED",
                        "senderID": MYID
                    })
                    break    
                case "requestSucceeded": 
                    receivedRequestID = msg.requestID
                    break
                default: 
                    props.receiveRequest(msg)
                    break
            }
        })
        
    }, [])
    return(<></>)
}