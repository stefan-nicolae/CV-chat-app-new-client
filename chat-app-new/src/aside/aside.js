import "./aside.css"
import { useEffect, useRef, useState } from "react"
import Friend from "./friend"
import * as Network from "../main/network" 

function scrollDown (asidePrompt) {
    if(asidePrompt.current !== undefined) {
        const scroll = asidePrompt.current.scrollHeight - asidePrompt.current.scrollTop - asidePrompt.current.clientHeight
        if(scroll <= 200) asidePrompt.current.scrollTop = asidePrompt.current.scrollHeight - asidePrompt.current.clientHeight
    }
}

function removePrompt(target, promptArr, setPromptArr){
    let index = 0
    const newPromptArr = []
    promptArr.forEach((prompt) => {
            if(index !== target) {
                newPromptArr.push(prompt)
            }
            index++
    })
    setPromptArr(newPromptArr)
}

export default function Aside (props) {
    const enableDefaultFriends =    ((window.location.pathname.includes("defaults")) || (window.location.pathname.includes("default_friends")))
    const enableDefaultPromptArr =  (window.location.pathname.includes("defaults"))

    const defaultFriends = enableDefaultFriends ? [
        {id: 1, name: "user1"}, 
        {id: 2, name: "user2"}, 
        {id: 3, name: "user3"}, 
        {id: 4, name: "user4"}, 
        {id: 5, name: "user5"}, 
        {id: 6, name: "user6"}, 
        {id: 7, name: "user7"}, 
        {id: 8, name: "user8"}, 
        {id: 9, name: "user9"}, 
        {id: 10, name:"user10"},
        {id: 11, name:"user11"}
    ] : []
    
    const defaultPromptArr = enableDefaultPromptArr ? 
    [

    ] : []

    const aside = useRef()
    const key=useRef(0)
    const friends = useRef(defaultFriends) 
    const friendsRequestsSent = useRef({})
    const lastRequestReceived = useRef()
    const promptIndex = useRef(0)
    const lastPromptInformation = useRef()
    const asidePrompt = useRef()
    const newMsgCounter = useRef({})
    const lastMessageAlert = useRef({})
    const last_isItScrolledDown = useRef({})

    const [promptArr, setPromptArr] = useState(defaultPromptArr)
    const [messageAlert, setMessageAlert] = useState()
    const [promptVisibility, setPromptVisibility] = useState(true)
    const promptInformation = props.asidePromptInformation
    const updatePromptArr = item => {
        const newPromptArr = []
        if(promptArr.length) newPromptArr.push(promptArr)
        newPromptArr.push(item)
        document.querySelector("#hide-aside-prompt").classList.add("selected")
        setPromptArr(
            newPromptArr
        )
    }

    if(promptInformation !== lastPromptInformation.current) {
        lastPromptInformation.current = promptInformation
        updatePromptArr(promptInformation)
    }

    const addPeer= (id, nickname) => {
        let pass = true
        if(id == props.MYID) return
        friends.current.forEach(friend => {
            if(friend.id == id) { pass=false; return }
        })
        if(!pass && !props.blockList.current[id]) return
        props.blockList.current[id] = false
        
        Network.sendRequest({
            "msgType": "addPeer",
            "peerID": id,
            "senderID": props.MYID
        })
        
        friendsRequestsSent.current[id] = nickname
    }

    const removePeer = (id) => {
        if(props.blockList.current[id] === true) return
        props.blockList.current[id] = true
        Network.sendRequest({
            "msgType": "removePeer",
            "peerID": id,
            "senderID": props.MYID
        })
    }


    
    const addFriendGUI =(id, nickname=undefined, CALLBACKINDEX=undefined) => {
        const addThem = () => {
            friends.current.forEach(friend => {
                friend.is_selected = false
            })
            friends.current.push(
                {
                    id: id, name: nickname, is_selected: true
                }
            )
            const waitForIt = () => {
                Network.waitForRequestID(id + "still_there", () => { waitForIt() }, () => {
                    getRemoved(id, true)
                })
            }
            waitForIt()
            setInterval(()=>{
                Network.sendRequest({
                    "msgType": "requestSucceeded",
                    "peerID": id,
                    "requestID": props.MYID + "still_there"
                })
            }, 10000)
            setTimeout(()=>{
                props.setINTERLOCUTOR(id) 
            },100)
        }
        
        if(nickname) {
                Network.waitForRequestID(id + "fine_to_add", () => {
                    addThem()
                })
        }
        else{
            removePrompt(CALLBACKINDEX, promptArr, setPromptArr)
            const INDEX = promptIndex.current++
            updatePromptArr(
                <div className="set-nickname-prompt" >
                    <p>Set nickname for {id}</p>
                    <input onKeyDown={(event) => {
                        if(event.code === "Enter") {
                            nickname = event.currentTarget.value
                            if(nickname.startsWith(" ") || nickname.startsWith("#") || nickname === "" || nickname.length > 16) return

                            removePrompt(INDEX, promptArr, setPromptArr)
                            Network.sendRequest({
                                "msgType": "requestSucceeded",
                                "peerID": id,
                                "requestID": props.MYID + "fine_to_add"
                            })
                            addThem()
                        }
                    }} type="text"></input>
                </div>
            )
        }
    }
    
    
    const getAdded = (request) => {
        if(request.requestID && friendsRequestsSent.current[request.senderID]) {
            Network.sendRequest({
                "msgType": "requestSucceeded",
                "peerID": request.senderID,
                "requestID": request.requestID
            })
            addFriendGUI(request.senderID, friendsRequestsSent.current[request.senderID])
        }
        else {
            if(props.blockList.current[request.senderID]) return
            const INDEX = promptIndex.current++
            updatePromptArr(
                <p className="add-friend-prompt">
                    { request.senderID } wants to add you. 
    
                    <span onClick={(event) => {
                        removePrompt(INDEX, promptArr, setPromptArr)
    
                        const requestID = Math.random()
                        Network.sendRequest({
                            "msgType": "addPeer",
                            "peerID": request.senderID,
                            "requestID": requestID,
                            "senderID": props.MYID
                        })
                        Network.waitForRequestID(requestID, () => {                            
                            addFriendGUI(request.senderID, undefined, INDEX)
                        })
                    }}>accept </span>
    
                    <span onClick={(event) => {

                        props.blockList.current[request.peerID] = true
                        removePrompt(INDEX, promptArr, setPromptArr)
                    }}>decline </span>
                </p>
            )
        }
    }

    const getRemoved = (senderID, disconnected=false) => {
        friends.current.forEach(friend => {
            if(friend.id == senderID) {
                if(friend.is_closed === true) return
                friend.is_closed = true
                setTimeout(() => {
                    updatePromptArr(<p>{senderID} {disconnected ? "disconnected." : "removed you."}</p>)
                    props.setINTERLOCUTOR("closed" + friend.id)
                },100)
            }
        })
    }

    const receiveDisconnect = (senderID) => {
        friends.current.forEach(friend => {
            if(friend.id == senderID) {
                getRemoved(senderID, true)
            }
        })
    }

    const forceAdd = (id, nickname) => {
        Network.sendRequest({
            "msgType": "requestSucceeded",
            "peerID": id,
            "requestID": props.MYID + "fine_to_add"
         })
        addFriendGUI(id, nickname)
    }

    useEffect(() => {
        props.handleFileDrop(aside.current)
        scrollDown(asidePrompt)
    })

    const newMessageAlert = (ID) => {
        setMessageAlert({id: ID})
    }

    if(props.requestReceived !== lastRequestReceived.current) {
        lastRequestReceived.current = props.requestReceived 
        switch(props.requestReceived.msgType) { 
            case "addPeer": 
                getAdded(props.requestReceived)
                break
            case "removePeer":
                getRemoved(props.requestReceived.senderID, true)
                break
            case "disconnect":
                receiveDisconnect(props.requestReceived.ID)
                break
            case "BLOCKED":
                getRemoved(props.requestReceived.senderID, true)
                break
            case "textMessage":
                newMessageAlert(props.requestReceived.senderID)
                break
            case "fileMessage":
                newMessageAlert(props.requestReceived.senderID)
                break
            case "forceAdd":
                forceAdd(props.requestReceived.senderID, props.requestReceived.nickname)
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

    const togglePromptVisibility = () => {
        document.querySelector("#hide-aside-prompt").classList.remove("selected")
        if(promptVisibility) setPromptVisibility(false)
        else setPromptVisibility(true)
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
                    return(<Friend last_isItScrolledDown={last_isItScrolledDown.current} isItScrolledDown={props.isItScrolledDown} lastMessageAlert={lastMessageAlert.current} newMsgCounter={newMsgCounter.current} messageAlert={messageAlert} removePeer={removePeer} key={key.current++} INTERLOCUTOR={props.INTERLOCUTOR} setINTERLOCUTOR={props.setINTERLOCUTOR} friend={friend} friends={friends}/>)
                })
            }
            <div className="friend add-friend">
                <span className="plus"><iconify-icon icon="ant-design:plus-circle-twotone"></iconify-icon></span>
                <input onKeyDown={event => handleInput(event)} placeholder="nickname_of_your_choice#their_ID"></input>
            </div>
            </div>
            <button onClick={() => {togglePromptVisibility()}}id="hide-aside-prompt"><iconify-icon icon="bi:arrow-bar-up"></iconify-icon></button>
            <div onClick={() => {
                        document.querySelector("#hide-aside-prompt").classList.remove("selected")
            }} ref={asidePrompt} style={{display: promptVisibility ? "unset" : "none"}}className="aside-prompt">
                {
                    promptArr.map(item => {
                        return(<div key={promptItemKey++} className="aside-prompt-item">{item}</div>)
                    })
                }
            </div>
        </div>
    ) : (
        <div className="aside"></div>
    )
}