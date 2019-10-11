import { GET_LINKED_VIDEOS} from './action-types'

import { 
	getLinkedVideos as get_linkedVideos} from './video-server-actions'



export var getLinkedVideos = () => dispatch => {
	var onSucsess = (linked_videos) => {

		dispatch({
			type: GET_LINKED_VIDEOS,
			payload: linked_videos.map(vid => parseInt(vid))
		})
	}


	get_linkedVideos(dispatch, onSucsess, /*onFailure=*/ () => {})
}


