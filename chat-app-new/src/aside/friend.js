
export default function Friend (props) {    
    if(props.newMsgCounter[props.friend.id] === undefined) props.newMsgCounter[props.friend.id] = 0 //leave this as is
    if(props.last_isItScrolledDown[props.friend.id] === undefined) props.last_isItScrolledDown[props.friend.id] = true

    if(props.isItScrolledDown) {
        const arr = props.isItScrolledDown.split(" ")
        if(arr[1] == props.friend.id) {
            if(arr[0] === "true") { 
                props.newMsgCounter[props.friend.id] = 0;
                props.last_isItScrolledDown[props.friend.id] = true
            }
            else if(arr[0] === "false") {
                props.last_isItScrolledDown[props.friend.id] = false
            }
        }
    }

    if(props.lastMessageAlert[props.friend.id] !== props.messageAlert) {
        props.lastMessageAlert[props.friend.id] = props.messageAlert

        if(props.messageAlert.id == props.friend.id) {
            if(props.friend.id !== props.INTERLOCUTOR) {     
                props.newMsgCounter[props.friend.id]++
            } else {
                if(props.last_isItScrolledDown[props.friend.id] !== true) {
                    props.newMsgCounter[props.friend.id]++
                } else {
                    props.newMsgCounter[props.friend.id] = 0;
                }
            }
    
        }
    }

    let className = "friend"
    if(props.friend.is_selected) className += " friend-selected"
    if(props.friend.is_closed) className += " enemy"

    const closeFriend = () => {
        if(props.friend.is_closed === true) return
        props.friend.is_closed = true
        props.removePeer(props.friend.id)
    }

    const setINTERLOCUTOR = () => {
        props.friends.current.forEach(friend => {
            friend.is_selected = false
        })
        props.friend.is_selected = true
        if(props.friend.is_closed) props.setINTERLOCUTOR("closed" + props.friend.id)
        else props.setINTERLOCUTOR(props.friend.id)
    }

    return(
        <div onClick={event => setINTERLOCUTOR(event)}  className={className}>
            <span className="new-message">{props.newMsgCounter[props.friend.id] !== 0 ? props.newMsgCounter[props.friend.id] : "" }</span>
            <span onClick={event => closeFriend(event)} className="close-friend">✖</span>
            <p>{props.friend.name}</p>
            <span className="friend-id">{props.friend.id}</span>
        </div>
        )
}