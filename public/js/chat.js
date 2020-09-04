const socket = io()

//elements
const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username,  room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

//Autoscroll
const autoscroll = () => {

    //new msg element
    const $newMessage = $messages.lastElementChild

    //height of new msg
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <=scrollOffset) {
        $messages.scrollTop  = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    //loading HTML using mastache library
    const html =Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    }) 
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

//Location URL
socket.on('locationMessage', (message) => {
    //loading google maps using mastache library
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
    
})


//roomData
socket.on('roomData', ({ room, users }) => {
    //display sidebar
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    //disable the form
    $messageFormButton.setAttribute('disabled', 'disabled')

    e.preventDefault()
    const msgText = e.target.elements.message.value
    
    socket.emit('sendMessage', msgText, (error) => {
        //enable the form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
    })
})

$sendLocationButton.addEventListener('click', () => {
    

    if(! navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    //disable button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location is shared!')
        })
    })
})

socket.emit('join', { username, room }, (err) => {
    if(err) {
        alert(err)
        location.href = '/'
    }
})