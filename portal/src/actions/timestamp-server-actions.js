import {
	httpsCall
} from './general-actions'

const TIMESTAMP_SERVER_URL = 'https://scene-stamp-server.herokuapp.com'
//const TIMESTAMP_SERVER_URL = 'http://localhost:8081'





export var login = (dispatch,data, onSucsess, onFailure) => {

	var options = {
		headers: {
			username: data.username,
			password: data.password
		}
	}

	httpsCall(dispatch, TIMESTAMP_SERVER_URL + '/login',
		options,
		onSucsess,
		onFailure)
}