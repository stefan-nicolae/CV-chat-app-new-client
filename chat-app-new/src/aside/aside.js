import "./aside.css"
import React, { useEffect, useRef, useState } from "react"
import Friend from "./friend"
import * as Network from "../main/network" 


export default function Aside (props) {
    const enableDefaultFriends = 0
    const enableDefaultPromptArr = 0

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
        {id: 10, name:"asdasdasd"}
    ] : []
    
    const defaultPromptArr = enableDefaultPromptArr ? 
    [
        "i am ", 
        "incredibly", 
        "stupid",
        "i am ",
        "incredibly",
        "stupid",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    ] : []

    const aside = useRef()
    const key=useRef(0)
    const friends = useRef(defaultFriends) //array
    
    const friendsRequestsSent = useRef({})
    const blockList = useRef({})
    const [promptArr, setPromptArr] = useState(defaultPromptArr)
    const lastRequestReceived = useRef()
    const [state, setState] = useState()

    const addFriendGUI =(id, nickname=undefined) => {
        const addThem = () => {
            friends.current.forEach(friend => {
                friend.is_selected = false
            })
            friends.current.push(
                {
                    id: id, name: nickname, is_selected: true
                }
            )
            props.setINTERLOCUTOR(id) 
        }
        if(nickname) addThem()
        else {
            const newPromptArr = []
            if(promptArr.length) newPromptArr.push(promptArr)
            newPromptArr.push(
                <div className="set-nickname-prompt" >
                    <p>Set nickname for {id}</p>
                    <input onKeyDown={(event) => {
                        if(event.code === "Enter") {
                            nickname = event.currentTarget.value
                            if(nickname === "") return
                            //DELETED
                            addThem()
                        }
                    }} type="text"></input>
                </div>
            )
            setPromptArr(newPromptArr)
        }
    }
    

    const addPeer= (id, nickname) => {
        friends.current.forEach(friend => {
            if(friend[id] === id) return
        })
        
        Network.sendRequest({
            "msgType": "addPeer",
            "peerID": id
        })
        
        blockList[id] = false
        friendsRequestsSent.current[id] = nickname
    }

    const removePeer = (id) => {
        if(blockList[id] === true) return
        blockList[id] = true
        Network.sendRequest({
            "msgType": "removePeer",
            "peerID": id
        })
    }

    const getAdded = (request) => {
        if(request.requestID && friendsRequestsSent[request.peerID]) {
            Network.sendRequest({
                "msgType": "requestSucceeded",
                "peerID": request.peerID,
                "requestID": request.requestID
            })
            addFriendGUI(request.peerID)
            return
        }
        if(blockList[request.peerID]) return
        const newPromptArr = []
        if(promptArr.length) newPromptArr.push(promptArr)
        newPromptArr.push(
            <p className="add-friend-prompt">
                {request.peerID } wants to add you. 

                <span onClick={(event) => {
                    //accept

                    const requestID = Math.random()
                    Network.sendRequest({
                        "msgType": "addPeer",
                        "peerID": request.peerID,
                        "requestID": requestID
                    })
                    //DELETED
                    Network.waitForRequestID(requestID).then(() => {
                            addFriendGUI(request.peerID, friendsRequestsSent[request.peerID])
                    })
                }}>accept </span>

                <span onClick={(event) => {
                    //decline
                    //DELETED
                    blockList[request.peerID] = true
                }}>decline </span>
            </p>
        )
        setPromptArr(newPromptArr)
    }

    useEffect(() => {
        props.handleFileDrop(aside.current)

        //scan for deleted prompts, if you find any, update the promptArr without them
        
    })

    
    if(props.requestReceived !== lastRequestReceived.current) {
        lastRequestReceived.current = props.requestReceived 
        switch(props.requestReceived.msgType) { 
            // ADDPEER RECEIVE
            case "addPeer": 
                getAdded(props.requestReceived)
        }   
    }

    const handleInput = (event) => {
        if(event.code === "Enter") {
            const value = event.currentTarget.value
            if(!value.includes("#")) return
            const arr = value.split("#") 
            const nickname = arr[0]
            const id = arr[1]
            if(nickname === "" || id === "") return
            event.currentTarget.value = ""
            addPeer(id, nickname)
        }
    }

    let promptItemKey = 0
    return props.MYID ? (
        <div className="aside" ref={aside} data-identifier="2">
            <div className="uid">
                {props.nickname}#{props.MYID}
            </div>
            <div className="friends">
            {
                friends.current.map(friend => {
                    return(<Friend removePeer={removePeer} key={key.current++} INTERLOCUTOR={props.INTERLOCUTOR} setINTERLOCUTOR={props.setINTERLOCUTOR} friend={friend} friends={friends}/>)
                })
            }
            {/* ADDPEER SEND */}
            <div className="friend add-friend">
                <span className="plus"><iconify-icon icon="ant-design:plus-circle-twotone"></iconify-icon></span>
                <input onKeyDown={event => handleInput(event)} placeholder="nickname_of_your_choice#their_ID"></input>
            </div>
            </div>
            <div className="aside-prompt">{
                promptArr.map(item => {
                    return(<div key={promptItemKey++} className="aside-prompt-item">{item}</div>)
                })
            }</div>
        </div>
    ) : (
        <div className="aside"></div>
    )
}