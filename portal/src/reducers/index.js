import {combineReducers} from 'redux'

import notificationReducer from './notification-reducer'
import timestampReducer from './timestamp-reducer'
import authenticateReducer from './authenticate-reducer'

export default combineReducers({
	notification:notificationReducer,
	timestamp:timestampReducer,
	authenticate:authenticateReducer
})
