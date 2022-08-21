const messages = {}
export function storeMessage(message, INTERLOCUTOR) {
    if(messages[INTERLOCUTOR] === undefined) messages[INTERLOCUTOR] = []
    messages[INTERLOCUTOR].push(message)
}

export function getMessages(INTERLOCUTOR) {
    if(!messages[INTERLOCUTOR]) return []
    return messages[INTERLOCUTOR]
}