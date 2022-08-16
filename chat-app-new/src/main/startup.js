import { useEffect, useRef } from "react"

export default function Startup (props) {
    const startup = useRef()

    useEffect(() => {
        props.handleFileDrop(startup.current)
    })

    const setNickname = event => {
        if(event.code === "Enter") {
            props.setNickname(event.currentTarget.value)
        }
    }
    return(
        <div className="startup" ref={startup} data-identifier="1">
            <h1>Enter your nickname</h1>
            <input onKeyUp={(event) => {setNickname(event)}}></input>
        </div>
    )
}