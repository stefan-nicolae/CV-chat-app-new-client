import "./aside.css"
import { useEffect, useRef } from "react"
import Friend from "./friend"


export default function Aside (props) {
    const enableDefaultFriends = true
    const defaultFriends = enableDefaultFriends ? [
        {id: 1, name: "asdasdasd"}, 
        {id: 2, name: "asdasdasd"}, 
        {id: 3, name: "asdasdasd"}, 
        {id: 4, name: "asdasdasd"}, 
        {id: 5, name: "asdasdasd"}, 
        {id: 6, name: "asdasdasd"}, 
        {id: 7, name: "asdasdasd"}, 
        {id: 8, name: "asdasdasd"}, 
        {id: 9, name: "asdasdasd"}, 
        {id: 10, name: "asdasdasd"}
    ] : []

    const aside = useRef()
    const key=useRef(0)
    const friends = useRef(defaultFriends)

    useEffect(() => {
        props.handleFileDrop(aside.current)
    })

    return props.MYID ? (
        <div className="aside" ref={aside} data-identifier="2">
            <div className="uid">
                {props.nickname} {props.MYID}
            </div>
            <div className="friends">
            {
                friends.current.map(friend => {
                    return(<Friend key={key.current++} INTERLOCUTOR={props.INTERLOCUTOR} setINTERLOCUTOR={props.setINTERLOCUTOR} friend={friend} friends={friends}/>)
                })
            }
            <div className="friend add-friend">
                <span className="plus"><iconify-icon icon="ant-design:plus-circle-twotone"></iconify-icon></span>
                <input placeholder="nickname_of_your_choice#their_ID"></input>
            </div>
            </div>
        </div>
    ) : (
        <div className="aside"></div>
    )
}