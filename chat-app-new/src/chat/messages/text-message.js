function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
  };

  export default function TextMessage (props) {
      const className = `message text-message ${props.me ? "me" : "them"} ${props.isClosed ? "msgClosed" : ""}`
      if(isValidURL(props.message)) {
        if(!props.message.startsWith("www.")) props.message = "www." + props.message
        if(!props.message.startsWith("http://")) props.message = "http://" + props.message
      }

    return(<div className={className}>
        {
            isValidURL(props.message) ?<a href={props.message}>{props.message}</a> : props.message
        }
    </div>)
}