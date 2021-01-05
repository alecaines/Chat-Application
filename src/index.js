const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');


app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {

	//event listeners
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });
		
		console.log('(indexjs:27) user',user);
		console.log('error',error);
		if(error !== undefined){
			return callback(error);
		}
		
		console.log('(index.js:33) made it past error block');

		socket.join(user.room);
		socket.emit('message', generateMessage('Admin', 'Welcome!'));
		socket.broadcast.to(user.room).emit('message', generateMessage(user.username+" has joined!"));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user, user.room),
		});

		callback();
	});

	socket.on('sendMessage', (message, room, callback) => {
		const user = getUser(socket.id)[0];
		const filter = new Filter();
		
		if(filter.isProfane(message)){
			return callback('Profanity is not allowed');
		}
		//io.to(user.room).emit('message', generateMessage(user.username, message));
		io.to(user.room).emit('message', generateMessage(user.username, message));
		callback();
	});

	socket.on('sendLocation', (latlon, callback) => {
		const user = getUser(socket.id)[0];
		console.log('(index.js:54) user', user);
		console.log('(index.js:54) latlon', latlon);
		const content = generateLocationMessage(user.username, "https://google.com/maps?q="+latlon.lat+","+latlon.lon);
		console.log('(index.js:57) generateLocationMessage', content);
		io.to(user.room).emit('locationMessage', content);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		
		if(user){
			io.to(user.room).emit('message', generateMessage(user.username+' has left'));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user, user.room),
			});

		}

	});
});

server.listen(port, () => {
	console.log('Server is up on port '+port);
});
