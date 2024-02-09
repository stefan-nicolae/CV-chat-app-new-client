const params = Array.from(new URLSearchParams(window.location.search))

let URLkeywords = params.getAll('keywords')
URLkeywords = URLkeywords.length ? URLkeywords[0].replaceAll(" ", '').split(",") : []

const chatID = params.getAll('chatID')

export { URLkeywords, chatID }