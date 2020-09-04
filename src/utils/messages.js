// to dispaly a msg with timestamp
const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

//to display location with timestamp
const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}