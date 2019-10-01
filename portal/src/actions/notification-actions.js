import {
	API_NEW_REQUEST,
	API_REQUEST_ERROR
} from './action-types'


export var notifyApiError = (errorMessage) => dispatch => {
	dispatch({
		type: API_REQUEST_ERROR,
		payload: errorMessage
	})
}

export var newApiRequest = () => dispatch => {
	dispatch({
		type: API_REQUEST_ERROR,
	})
}