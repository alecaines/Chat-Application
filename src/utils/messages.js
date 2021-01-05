const generateMessage = (username, text) => {
	console.log('(messagesjs:2) username?',username);
	console.log(text);
	return {
		username,
		text,
		createdAt: new Date().getTime()
	}
}

const generateLocationMessage = (username, url) => {
	console.log('(messagesjs:12) username?',username);
	return {
		username,
		url,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage,
	generateLocationMessage
}
