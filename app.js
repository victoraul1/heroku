const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAAAAJZCamKVQBALR9IN5n4cxWaAwF7Dlx2sLvVVzts1wYFipsp8N7RbzIqXRAbAJzZAeOKv1QZB12isuJPnP2BmtftaqLTao3a5Lsqd0dxPfxADEcTZA6IqjsArQGDjkzZA1TJqsIOvZBWh36UOBml3F3cT3nadTNUrRhZAkyO3QwZDZD'

var app = express()

app.use(bodyParser.json())

var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
	console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
	res.send('Abriendo el puerto desde mi pc Local sin http://ngrok.com')
})

app.get('/webhook',function(req, res){
	if(req.query['hub.verify_token'] === 'hello_token'){
		res.send(req.query['hub.challenge'])
	}else{
		res.send('Tu no tienes que entrar aqui')
	}
})

app.post('/webhook',function(req, res){
	var data = req.body
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){					
					getMessage(messagingEvent)
				}
			})
		})
	}
	res.sendStatus(200)
})

function getMessage(event){
	var senderID = event.sender.id
	var messageText = event.message.text

	evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
	var mensaje = '';

	if(isContain(messageText,'Good morning')){
		mensaje = 'Good morning you all'
	}else if(isContain(messageText,'who is Victor?')){
		mensaje = 'He is my creator'
	}else if(isContain(messageText,'who is Rey?')){
                mensaje = 'did you say Rey?'	
	}else if(isContain(messageText,'yes, Rey')){
                mensaje = 'I dont know, he is not on my list of friends'		
	}else if(isContain(messageText,'where are you?')){
		mensaje = 'out there'
	}else if(isContain(messageText,'do you want to be my friend?')){
		mensaje = 'yes Victor'
	}else if(isContain(messageText,'who are you?')){
                mensaje = 'my name is Homeless'	
		
	}else if(isContain(messageText,'what is your name?')){
                mensaje = 'my name is Homeless'	
	}else if(isContain(messageText,'hello Homeless')){
                mensaje = 'Hello Victor'
		
	}else if(isContain(messageText,'tell me a story')){
                mensaje = 'Once upon a time, there was a boy whose name was Pinocchio and all he wanted was to be just like the other kids, a human being.'	
		
	}else if(isContain(messageText,'give me a shake')){
		enviarMensajeImagen(senderID)
	}else if(isContain(messageText,'profile')){
		enviarMensajeTemplate(senderID)
	}else if(isContain(messageText,'clima') || isContain(messageText,'temperatura')){
		getClima(function(_temperatura){
			enviarMensajeTexto(senderID, getMessageCLima(_temperatura))
		})
	}else{
		mensaje = 'I can only repeat your message '+ messageText
	}

	enviarMensajeTexto(senderID, mensaje)
}

function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient: {
			id : senderID
		},
		message: {
			attachment :{
				type: "template",
				payload: {
					template_type: 'generic',
					elements: [elementTemplate(),elementTemplate(),elementTemplate(),elementTemplate()]
				}
			}
		}
	}

	callSendAPI(messageData)
}

function elementTemplate(){
	return {
		title: "Victor Raul Galindo",
		subtitle: "Email Marketer & Web Developer",
		item_url: "http://victorgalindo.com",
		image_url: "http://victoraul.com/victorgalindo/wp-content/uploads/2016/10/victorgalindo.jpg",
		buttons: [
			buttonTemplate('Contact','http://informaticomanchay.com/contacto'),
			buttonTemplate('Portfolio','http://victorgalindo.com')
		]
	}
}

function buttonTemplate(title,url){
	return {
		type: 'web_url',
		url: url,
		title: title
	}
}

//enviar imagen

function enviarMensajeImagen(senderID){
	var messageData = {
		recipient : {
			id: senderID
		},
		message:{
			attachment:{
				type: "image",
				payload: {
					url: 'http://jjvirgin.com/wp-content/uploads/2012/08/strawberry-shake.jpg'
				}

			}
		}
	}

	callSendAPI(messageData)
}
//enviar texto plano
function enviarMensajeTexto(senderID, mensaje){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: mensaje
		}
	}

	callSendAPI(messageData)
}

//formatear el texto de regreso al cliente

function getMessageCLima(temperatura){
	if(temperatura > 30){
		return "Nos encontramos a " + temperatura +". Hay demasiado calor, comprate una gaseosa :V"
	}else{
		return "Nos encontramos a " + temperatura +" es un bonito dia para salir"
	}
}

//enviar texto en temperatura
function getClima(callback){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data)
				var temperatura = response.weatherObservation.temperature
				callback(temperatura)
			}else{
				callback(15) //temperatura por defecto
			}
		})
}

function callSendAPI(messageData){
	//api de facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function(error, response, data){
		if(error)
			console.log('No es posible enviar el mensaje')
		else
			console.log('Mensaje enviado')
	})
}

function isContain(texto, word){
	if(typeof texto=='undefined' || texto.lenght<=0) return false
	return texto.indexOf(word) > -1
}
