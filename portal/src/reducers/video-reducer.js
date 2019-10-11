import {
	GET_LINKED_VIDEOS
} from "../actions/action-types";

const initialState = {
	linked_videos: [],
};

function videoReducer(state = initialState, action) {
	switch (action.type) {
		case GET_LINKED_VIDEOS:
			return {
				...state,
				linked_videos: action.payload
			};
		default:
			return state;
	}
}

export default videoReducer;
