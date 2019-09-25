import {combineReducers} from 'redux'

import navReducer from './nav-reducer'
import timestampReducer from './timestamp-reducer'

export default combineReducers({
	nav:navReducer,
	timestamp:timestampReducer
})
