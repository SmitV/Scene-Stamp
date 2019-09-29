import {
	GET_TABS,
	UPDATE_SIDENAV_EXPANDED
} from '../actions/action-types'

const initialState = {
	tabs: [],
	expanded:false
};

function navReducer(state = initialState, action) {
	switch(action.type){
		case GET_TABS:
			return {
				...state,
				tabs: action.payload}
		case UPDATE_SIDENAV_EXPANDED:
			return {
				...state,
				expanded: action.payload}
		default:
			return state

	}
};

export default navReducer;