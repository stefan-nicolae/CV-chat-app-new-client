import { useEffect } from "react"
console.log("network starting")

const PRODUCTION = 1
let socket

if(PRODUCTION) {
    try {
        const SERVER_URL = "wss://chat.example.com"
        socket = new WebSocket(SERVER_URL)
    }
    
    catch {
        const SERVER_URL = "wss://cv-chat-app-server.onrender.com"
        socket = new WebSocket(SERVER_URL)
    }

} else socket = new WebSocket("ws://localhost:8082")



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
export function waitForRequestID(requestID, callback=()=>{}, errorCallback=()=>{}) {
    //if it doesn't come within 15 seconds, return false, else return true :)
    console.log('waiting for ' + requestID)
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
            console.log(msg)
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