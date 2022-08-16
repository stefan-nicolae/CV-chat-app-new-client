export default function TextMessage (props) {
    const className = `message text-message ${props.me ? "me" : "them"}`
    return(<div className={className}>
        {props.message}
    </div>)
}