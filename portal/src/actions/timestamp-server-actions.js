
const TIMESTAMP_SERVER_URL = 'https://scene-stamp-server.herokuapp.com'
//const TIMESTAMP_SERVER_URL = 'http://localhost:8081'


export var login = (data, onSucsess, onFailure) => {
	fetch(TIMESTAMP_SERVER_URL + '/login',{
		headers:{
			username:data.username,
			password:data.password
		}
	}).then(res => {
		console.log('response returned')
		if(!res.ok) res.json().then( data => onFailure(data))
		else return res.json().then(data => onSucsess(data))
	})
}
