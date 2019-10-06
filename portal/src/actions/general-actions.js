import {notifyApiError, newApiRequest} from './notification-actions'


export var httpsCall = (dispatch, url, options, onSucsess, onFailure) => {
	dispatch(newApiRequest())
	fetch(url ,options).then(res => {
		if(!res.ok) res.json().then( data => {
			data.status = res.status
			dispatch(notifyApiError(data))
			return onFailure(data)
		})
		else return res.json().then(data => onSucsess(data))
	})
}