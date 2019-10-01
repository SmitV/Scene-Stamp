import {notifyApiError, newApiRequest} from './notification-actions'


export var httpsCall = (dispatch, url, options, onSucsess, onFailure) => {
	dispatch(newApiRequest())
	fetch(url ,options).then(res => {
		if(!res.ok) res.json().then( data => {
			dispatch(notifyApiError(data.error_message))
			return onFailure(data)
		})
		else return res.json().then(data => onSucsess(data))
	})
}