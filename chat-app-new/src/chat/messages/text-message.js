export default function TextMessage (props) {
    const className = `message text-message ${props.me ? "me" : "them"} ${props.isClosed ? "msgClosed" : ""}`
    return(<div className={className}>
        {props.message}
    </div>)
}