export default function Startup (props) {
    const setNickname = event => {
        if(event.code === "Enter") {
            props.setNickname(event.currentTarget.value)
        }
    }
    return(
        <div className="startup">
            <h1>Enter your nickname</h1>
            <input onKeyUp={(event) => {setNickname(event)}}></input>
        </div>
    )
}