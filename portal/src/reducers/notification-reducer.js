import {
	API_NEW_REQUEST,
	API_REQUEST_ERROR,
	CLEAR_ALL_ERRORS
} from '../actions/action-types'

const initialState = {
	error:null
};

function notificationReducer(state = initialState, action) {
	switch(action.type){
		case API_REQUEST_ERROR:
			return {
				...state,
				error:action.payload}
		case API_NEW_REQUEST:
			return {
				...initialState
			}
		case CLEAR_ALL_ERRORS:
			return {
				...initialState
			}
		default:
			return state

	}
};

export default notificationReducer;