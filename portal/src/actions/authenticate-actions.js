import {
	GET_LOCAL_AUTH_TOKEN,
	LOGIN_REQUEST_STATUS,
	LOGIN_USER,
	LOGOUT
} from './action-types'

import {login} from './timestamp-server-actions'



export var getLocalAuthToken = () => dispatch => {
	var localAuthToken = localStorage.getItem('ss_auth')
	dispatch({
		type: GET_LOCAL_AUTH_TOKEN,
		payload: localAuthToken
	})
}

export var loginWithCredentials = (data) => dispatch => {
	dispatch({
		type:LOGIN_REQUEST_STATUS,
		payload:true
	})

	var onSucsess = (auth_token) => {
		localStorage.setItem('ss_auth', auth_token)
		dispatch({
			type : LOGIN_USER,
			payload: auth_token
		})
	}

	var onFailure = (res) => {
		dispatch({
			type:LOGIN_REQUEST_STATUS,
			payload:false
		})
	}

	login(dispatch, data, onSucsess, onFailure)
}

export var logout = () => dispatch => {
	localStorage.removeItem('ss_auth')
	dispatch({
		type:LOGOUT
	})
}