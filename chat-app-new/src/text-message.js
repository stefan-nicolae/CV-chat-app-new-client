export default function TextMessage (props) {
    let message = props.message, me

    if(message.startsWith("me")) {
        me = true
        message = message.slice(2)
    }
    else if(message.startsWith("them")) {
        me = false
        message = message.slice(4)
    }
    else {
        console.error("message has no identifier")
        return
    }    
    
    const className = `message text-message ${me ? "me" : "them"}`
    return(<div className={className}>
        {message}
    </div>)
}