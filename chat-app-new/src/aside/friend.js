export default function Friend (props) {
    //USE A FRIENDS OBJECT THAT YOU CAN THEN MODIFY 
    let className = "friend"
    if(props.friend.is_selected) className += " friend-selected"
    if(props.friend.is_closed) className += " enemy"

    const closeFriend = event => {
        event.stopPropagation()
        if(props.friend.is_closed) return
        props.friend.is_closed = true
        props.setINTERLOCUTOR("closed" + props.INTERLOCUTOR)
    }

    const setINTERLOCUTOR = event => {
        event.stopPropagation()
        props.friends.current.forEach(friend => {
            friend.is_selected = false
        })
        props.friend.is_selected = true

        if(props.friend.is_closed) props.setINTERLOCUTOR("closed" + props.friend.id)
        else props.setINTERLOCUTOR(props.friend.id)
    }
    

    
    return(
        <div onClick={event => setINTERLOCUTOR(event)} className={className}>
            <p><span onClick={closeFriend} className="close-friend">✖</span>{props.friend.name}</p>
            <span className="friend-id">{props.friend.id}</span>
        </div>
        )
}