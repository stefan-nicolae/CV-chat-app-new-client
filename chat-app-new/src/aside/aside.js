import "./aside.css"
import { useEffect, useRef } from "react"


export default function Aside (props) {
    const aside = useRef()

    useEffect(() => {
        props.handleFileDrop(aside.current)
    })

    return props.MYID ? (
        <div className="aside" ref={aside} data-identifier="2">
            <div className="uid">
                {props.nickname} {props.MYID}
            </div>
        </div>
    ) : (
        <div className="aside"></div>
    )
}