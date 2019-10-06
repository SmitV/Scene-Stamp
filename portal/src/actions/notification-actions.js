import {
	API_NEW_REQUEST,
	API_REQUEST_ERROR,
	CLEAR_ALL_ERRORS
} from './action-types'


export var notifyApiError = (data) => dispatch => {
	dispatch({
		type: API_REQUEST_ERROR,
		payload: data
	})
}

export var newApiRequest = () => dispatch => {
	dispatch({
		type: API_NEW_REQUEST,
	})
}

export var clearErrors = () => dispatch => {
	dispatch({
		type: CLEAR_ALL_ERRORS,
	})
}
