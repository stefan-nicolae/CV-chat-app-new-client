export default function Friend (props) {
    //USE A FRIENDS OBJECT THAT YOU CAN THEN MODIFY 
    let className = "friend"
    if(props.friend.is_selected) className += " friend-selected"
    if(props.friend.is_closed) className += " enemy"

    const closeFriend = event => {
        if(props.friend.is_closed === true) return
        props.friend.is_closed = true
        props.removePeer()
    }

    const setINTERLOCUTOR = event => {
        props.friends.current.forEach(friend => {
            friend.is_selected = false
        })
        props.friend.is_selected = true
        if(props.friend.is_closed) props.setINTERLOCUTOR("closed" + props.friend.id)
        else props.setINTERLOCUTOR(props.friend.id)
    }
    
    return(
        <div onClick={event => setINTERLOCUTOR(event)}  className={className}>
            <span onClick={event => closeFriend(event)} className="close-friend">✖</span>
            <p>{props.friend.name}</p>
            <span className="friend-id">{props.friend.id}</span>
        </div>
        )
}