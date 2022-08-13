import "./aside.css"

export default function Aside (props) {
    return props.MYID ? (
        <div className="aside">
            <div className="uid">
                {props.nickname} {props.MYID}
            </div>
        </div>
    ) : (
        <div className="aside"></div>
    )
}