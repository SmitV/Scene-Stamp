import {
	GET_TABS
} from './action-types'


var sample_tabs = [{
	path: '/',
	text: 'Home'
}, {
	path: '/login',
	text: 'Login'
}]

export var getTabs = () => dispatch => {
		dispatch({
			type: GET_TABS,
			payload: sample_tabs
		})
}