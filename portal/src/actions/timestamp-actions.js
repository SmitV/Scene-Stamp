import {
	GET_COMPILATION_DATA,
	NEW_COMPILATION_DATA
} from './action-types'


var sample_compilation_data = [{
	title: 'Comp 1',
	views: 1000000
}, {
	title: 'Comp 2',
	views: 432000000
}, {
	title: 'Comp 3',
	views: 23000000
},
]

var createNewCompilation = () => {
	var id = Math.floor(Math.random() * (20 + 3 )) +4;
	return {
		title: 'Comp '+id,
		views: id * 1000000
	}
}

export var getCompilationData = () => dispatch => {
	dispatch({
		type: GET_COMPILATION_DATA,
		payload: sample_compilation_data
	})
}

export var newCompilation = () => dispatch => {
	dispatch({
		type: NEW_COMPILATION_DATA, 
		payload: createNewCompilation()
	})
}