import "./chat.css"
import TextMessage from "./text-message"
import { useEffect, useRef } from "react"

const enableDefaultMessages = false
let defaultMessagesHaveRan = false
function loadDefaultMessages(messageArr) {
    if(defaultMessagesHaveRan || !enableDefaultMessages) return
    defaultMessagesHaveRan = true
    for(let i = 0; i < 100; i++) {
        const identifier = (Math.random()>=0.5)? "me" : "them"
        const string = "a".repeat(1000)
        messageArr.push(identifier + string)
    }
}

function messageScrolling (event, scroll) {
    scroll.current = event.target.scrollHeight - event.target.scrollTop - event.target.clientHeight
}

function scrollDown (chatMain) {
    if(chatMain.current !== undefined)
        chatMain.current.scrollTop = chatMain.current.scrollHeight - chatMain.current.clientHeight
}

export default function Chat (props) {
    const messageArr = useRef([])
    const scroll = useRef([])
    const newMessage = useRef([false])
    const chatMain = useRef()
    loadDefaultMessages(messageArr.current)

    const enterInput = event => {
        if(event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            const message = event.currentTarget.value 
            event.currentTarget.value = ""
            if(message.startsWith(" ") || message.startsWith("\n") || message === "") return
            messageArr.current.push("me" + message) 
            props.setNewMSG({
                me: true,
                message: message,
                type: "text"
            })
            newMessage.current = true
        }
    }

    useEffect(() => {
        if(newMessage.current && scroll.current <= 500) {
            scrollDown(chatMain)
        }
    })

    let key = 0
    return props.MYID ? (
        <div className="chat">
            <div className="chat-main" onScroll={event => {messageScrolling(event, scroll)}} onDoubleClick={() => {scrollDown(chatMain)}} ref={chatMain}>
                {messageArr.current.map(message => {
                    return(<TextMessage message={message} key={key++}/>) 
                })}
            </div>
            <div className="chat-input">
                <textarea onKeyDown={enterInput} type="text"></textarea>
            </div>
        </div>
    ) : (
        <div className="chat"></div>
    )
}