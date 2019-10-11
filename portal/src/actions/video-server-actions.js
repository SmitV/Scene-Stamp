import { httpsCall } from "./general-actions";

import store from "../store";

const VIDEO_SERVER_URL = "http://ec2-18-221-3-92.us-east-2.compute.amazonaws.com:8081";
//const VIDEO_SERVER_URL = 'http://localhost:8081'

export var getLinkedVideos = (dispatch, onSucsess, onFailure) => {
	onSucsess(['36693 ', '776671'])
}


var videoServerCall = (dispatch, path, onSucsess, onFailure) => {
	var options = {
		headers: {
			test_mode: true,
			auth_token: store.getState().authenticate.local_auth_token
		}
	};

	httpsCall(dispatch, VIDEO_SERVER_URL + path, options, onSucsess, onFailure);
};
