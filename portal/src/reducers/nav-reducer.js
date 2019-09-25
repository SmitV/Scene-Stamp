import {
	GET_TABS
} from '../actions/action-types'

const initialState = {
	tabs: [],
};

function navReducer(state = initialState, action) {
	switch(action.type){
		case GET_TABS:
			return {
				...state,
				tabs: action.payload}
		default:
			return state

	}
};

export default navReducer;