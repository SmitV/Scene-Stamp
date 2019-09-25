// src/js/store/index.js
import {
	createStore,
	applyMiddleware
} from "redux";
import thunk from 'redux-thunk'

import rootReducer from "./reducers/index";

var initialState = {}

var middleware = [thunk]

const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

export default store;