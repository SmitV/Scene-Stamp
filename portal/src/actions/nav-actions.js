import {
	GET_TABS,
	UPDATE_SIDENAV_EXPANDED
} from './action-types'


var sample_tabs = [{
	path: '/',
	text: 'Home'
}, {
	path: '/login',
	text: 'Login',
	public:true
}]

export var getTabs = () => dispatch => {
		dispatch({
			type: GET_TABS,
			payload: sample_tabs
		})
}

export var updateSidenavExpanded = (expanded) => dispatch => {
		dispatch({
			type: UPDATE_SIDENAV_EXPANDED,
			payload: expanded
		})
}
