const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormButton = $messageForm.querySelector("button");
const $messageFormInput = $messageForm.querySelector("input");
const $nameForm = document.querySelector("#name-form");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector('#messages');
const $locationMessages = document.querySelector('#locationMessages');

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;


//Options
const  { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
}

socket.on('message', (message) => {
	console.log('(chat.js:21) message', message);
	const html = Mustache.render(messageTemplate, {
		message: message.text,
		username: message.username,
		createdAt: moment(message.createdAt).format('h:mm a')
	});

	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', (locationMessage) => {
	//$nameForm[0].value
	const html = Mustache.render(locationMessageTemplate, {
		username: locationMessage.username,
		url: locationMessage.url,
		createdAt: moment(message.createdAt).format('h:mm a')
	});
	$locationMessages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ room, users}) => {
	const html = Mustache.render(sidebarTemplate, {
		room, 
		users,
	});
	document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	$messageFormButton.setAttribute('disable','disabled');

	//disable
	//const name = $nameForm.querySelector('input').value;
	console.log("My name is", username);
	const message = e.target.elements.message.value;


	socket.emit('sendMessage', message, room, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value=''
		$messageFormInput.focus();
		//enable
		
		if(error){
			return console.log(error);
		}
		console.log("Delivered to the "+ room +" room.");
	});
});

$sendLocationButton.addEventListener('click', () => {
	if(!navigator.geolocation){
		return alert('Geolocation is not supported by your browser.');
	}
	
	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation',{
			 lat : position.coords.latitude,
			 lon : position.coords.longitude
		}, (error) => {
			$sendLocationButton.removeAttribute('disabled');
			if(error){
				return console.log(error);
			}
			console.log("Location delivered");
		});
	});

});

socket.emit('join', { username, room }, (error) => {
	if(error){
		alert(error);
		location.href='/'
	}
});
