const params = new URLSearchParams(window.location.search)

let URLkeywords = Array.from(params.getAll('keywords'))
URLkeywords = URLkeywords.length ? URLkeywords[0].replaceAll(" ", '').split(",") : []

const chatID = params.getAll('chatID')[0]

export { URLkeywords, chatID }