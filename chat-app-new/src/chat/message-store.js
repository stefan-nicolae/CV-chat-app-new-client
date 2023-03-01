const messages = {}
export function storeMessage(message, INTERLOCUTOR) {
    if(messages[INTERLOCUTOR] === undefined) messages[INTERLOCUTOR] = []
    messages[INTERLOCUTOR].push(message)
}

export function getMessages(INTERLOCUTOR) {
    if(!messages[INTERLOCUTOR]) return []
    return messages[INTERLOCUTOR]
}

export function getMessageByRequestID(requestID, INTERLOCUTOR) {
    if(!messages[INTERLOCUTOR]) return {}
    const arr = messages[INTERLOCUTOR]
    for(let i = arr.length - 1; i>=0; i--) {
        if(arr[i].requestID === requestID) return arr[i]
    }
}