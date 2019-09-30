import {combineReducers} from 'redux'

import timestampReducer from './timestamp-reducer'
import authenticateReducer from './authenticate-reducer'

export default combineReducers({
	timestamp:timestampReducer,
	authenticate:authenticateReducer
})
