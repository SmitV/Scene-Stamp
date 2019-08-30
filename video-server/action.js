var https = require('https')
var fs = require('fs')

var cred = require('./credentials.js')
var taskScript = require('./taskScript')

var TASK_FILE_PATH = './tasks.json'
var DOWNLOAD_TASK_FILE_PATH = './download_tasks.json'

var SUB_TIMESTAMP_DURATION = 10

const {
	ROOT_DIR,
	UNLINKED_FOLDER,
	LINKED_FOLDER,
	COMPILATION_FOLDER,
	BRANDING_FOLDER
} = taskScript.getAllDirectories();

module.exports = {

	get_linkVideoToEpisode(params, orig_callback) {
		var t = this;
		var baton = t._getBaton("get_linkVideoToEpisode", params, orig_callback);

		function dataLoader(callback) {
			t._getAllUnlinkedVideos(baton, function(unlinked_videos) {
				t._getAllLinkedVideos(baton, function(linked_videos) {
					t._getEpisodeData(baton, function(episode_data) {
						callback(unlinked_videos, linked_videos, episode_data)
					});
				});
			});
		}

		function validate(params, unlinked_vids, linked_videos, episode_data, callback) {
			var localFile;
			if (!unlinked_vids.map(function(file) {
					return file[0]
				}).includes(params.unlinked_video)) {
				baton.setError({
					unlinked_video: params.unlinked_video,
					public_message: 'Invalid Params : unlinked video does not exist'
				})
				baton.throwError();
				return
			} else {
				localFile = unlinked_vids.filter(function(file) {
					return file[0] == params.unlinked_video
				})[0]
			}
			if (!episode_data.map(function(ep) {
					return ep.episode_id
				}).includes(parseInt(params.episode_id))) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: 'Invalid Params Episode Id: invalid id'
				})
				baton.throwError()
				return
			}
			if (linked_videos.map(function(file) {
					return file[0]
				}).includes(params.episode_id.toString())) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: 'Invalid Params Episode Id: already linked to video'
				})
				baton.throwError()
				return
			}

			//check if the file of the server is mp4
			if (localFile[1] !== 'mp4') {
				baton.setError({
					unlinked_video: localFile.join('.'),
					public_message: 'Invalid Params Unlinked Video: file must be in mp4 format'
				})
				baton.throwError()
				return
			}
			callback(localFile)
		}

		function renameFile(params, localFile, callback) {
			var oldFileName = UNLINKED_FOLDER + "/" + localFile.join('.')
			var newFileName = LINKED_FOLDER + '/' + params.episode_id + "." + localFile[1];
			fs.rename(oldFileName, newFileName, function(err) {
				if (err) {
					baton.setError({
						oldFileName: oldFileName,
						newFileName: newFileName,
						public_message: 'Internal Error Has Occured'
					})
					baton.throwError()
				}
				callback(newFileName)
			});
		}

		function submit(newFile) {
			baton.callOrigCallback({
				episode_id_linked: params.episode_id
			})
		}

		dataLoader(function(unlinked_videos, linked_videos, episode_data) {
			validate(params, unlinked_videos, linked_videos, episode_data, function(localFile) {
				renameFile(params, localFile, submit)
			})
		})

	},

	//remove all in progress video files , denoted with suffix 'ip_'
	removeInProgressVideos(callback) {
		var t = this
		var errorOccured = false;

		function removeFile(err) {
			if (err) {
				t._generateServerError(err);
				errorOccured = true;
			}
		}

		fs.readdir('./', (err, files) => {
			if (err) {
				t._generateServerError(err)
				return
			}
			files.filter(function(file) {
				return file.includes('ip_');
			}).forEach(function(file) {
				fs.unlink('./' + file, callback)
			})
		})

		if (!errorOccured) callback()
	},

	_getAllUnlinkedVideos(baton, callback) {
		baton.addMethod("_getAllUnlinkedVideos")
		this._getFilesFromDir(baton, UNLINKED_FOLDER, callback)
	},

	_getAllLinkedVideos(baton, callback) {
		baton.addMethod("_getAllLinkedVideos")
		this._getFilesFromDir(baton, LINKED_FOLDER, callback)
	},
	_getAllCompilationVideos(baton, callback) {
		baton.addMethod("_getAllCompilationVideos")
		this._getFilesFromDir(baton, COMPILATION_FOLDER, callback)
	},
	_getAllLogos(baton, callback) {
		baton.addMethod("_getAllLogos")
		this._getFilesFromDir(baton, BRANDING_FOLDER, callback)
	},

	_getFilesFromDir(baton, dir, callback) {
		fs.readdir(dir, (err, files) => {
			if (err) {
				baton.setError({
					error: err,
					public_message: "An Internal Error has occured"
				})
				baton.throwError()
				return
			}
			if (!files || files == undefined) callback([])
			callback(files.map(function(file) {
				return [file.split('.')[0], file.split('.')[1]]
			}))
		})
	},

	get_allUnlinkedVideos(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allUnlinkedVideos", null, orig_callback);

		this._getAllUnlinkedVideos(baton, function(unlinked_videos) {
			baton.callOrigCallback({
				videos: unlinked_videos.map(function(file) {
					return file[0]
				})
			})
		})
	},

	get_allLinkedVides(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allLinkedVides", null, orig_callback);

		this._getAllLinkedVideos(baton, function(linked_videos) {
			baton.callOrigCallback({
				videos: linked_videos.map(function(file) {
					return file[0]
				})
			})
		})
	},

	get_allCompilationVideos(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allCompilationVideos", null, orig_callback);

		this._getAllCompilationVideos(baton, function(comp_videos) {
			baton.callOrigCallback({
				videos: comp_videos.map(function(file) {
					return file[0]
				})
			})
		})
	},

	get_allLogos(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allLogos", null, orig_callback);

		this._getAllLogos(baton, function(logos) {
			baton.callOrigCallback({
				logo_names: logos.map(function(file) {
					return file[0]
				})
			})
		})
	},

	get_downloadYoutbeVideo(params, orig_callback) {
		var t = this;
		var baton = t._getBaton("get_downloadYoutbeVideo", params, orig_callback);

		function dataLoader(callback) {
			t._getAllLinkedVideos(baton,function(linked_videos) {
				t._readDownloadTaskFile(baton, function(download_tasks){
					callback(linked_videos,download_tasks)
				})
			})
		}


		function validateParams(params, linked_videos, download_tasks,callback) {
			if (params.youtube_link == undefined || params.youtube_link == null) {
				baton.setError({
					youtube_link: params.youtube_link,
					public_message: "Invalid Params: youtube link"
				})
				baton.throwError()
				return
			}
			if (params.episode_id == undefined || params.episode_id == null || parseInt(params.episode_id) == NaN) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: "Invalid Params: episode id"
				})
				baton.throwError()
				return
			}
			if (linked_videos.map(vid => {
					return vid[0]
				}).includes(params.episode_id)) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: "Invalid Params: episode already linked"
				})
				baton.throwError()
				return
			}
			if(download_tasks.tasks.map(task =>{return task.episode_id}).includes(params.episode_id)){
				baton.setError({
					episode_id: params.episode_id,
					public_message: "Invalid Params: episode download in process"
				})
				baton.throwError()
				return
			}
			if(download_tasks.tasks.map(task =>{return task.youtube_link}).includes(params.youtube_link)){
				baton.setError({
					episode_id: params.episode_id,
					public_message: "Invalid Params: youtube link download in process"
				})
				baton.throwError()
				return
			}
			callback()
		}

		dataLoader(function(linked_videos, download_tasks){
			validateParams(params, linked_videos, download_tasks,function(){
				t._updateDownloadTaskFile(baton, params, function(){
					baton.callOrigCallback(params)
				})
			})
		})
	},

	get_CreateCompilation(params, orig_callback) {
		var t = this;
		var baton = t._getBaton("get_CreateCompilation", params, orig_callback);


		function dataLoader(callback) {
			t._getAllLinkedVideos(baton, function(linked_videos) {
				t._getAllCompilationVideos(baton, function(compilation_videos) {
					callback(linked_videos, compilation_videos)
				})
			})
		}

		function validateCreateCompilationParams(linked_videos, compilation_videos, callback) {
			//check timestamps exist
			if (!Array.isArray(params.timestamps) || params.timestamps.length <= 0) {
				baton.setError({
					compilation_name: params.compilation_name,
					public_message: "Invalid Params: timestamps"
				})
				baton.throwError()
				return
			}
			//check compilation name exists
			if (!params.compilation_name || params.compilation_name.trim() == "") {
				baton.setError({
					compilation_name: params.compilation_name,
					public_message: "Invalid Params: compilation name"
				})
				baton.throwError()
				return
			}
			//validate each timestamp
			var errorOccur = false;
			params.timestamps.forEach(function(el) {
				if (typeof el.episode_id !== 'number' || typeof el.start_time !== 'number' || typeof el.duration !== 'number' || typeof el.timestamp_id !== 'number') {
					baton.setError({
						timestamp: el,
						public_message: "Invalid Params: invalid param in timestamp"
					})
					errorOccur = true
					return
				}
				if (!linked_videos.map(function(vid) {
						return vid[0]
					}).includes(el.episode_id.toString())) {
					baton.setError({
						episode_id: el.episode_id,
						public_message: "Invalid Params: episode id not present on server"
					})
					errorOccur = true
					return

					//TODO : validate duration / start time for each timestamp ; add else if {} here 
				} else {
					el.episode_name = linked_videos.filter(function(vid) {
						return vid[0] == el.episode_id.toString()
					})[0].join('.')
				}
			})
			if (errorOccur) {
				baton.throwError()
				return
			}
			//check logo if exists
			if (params.logo) {
				t._assertLogoExists(baton, params.logo, callback)
			} else {
				callback()
			}
		}

		dataLoader(function(linked_videos, compilation_videos) {
			validateCreateCompilationParams(linked_videos, compilation_videos, function() {
				t._postCompilation(baton, params, function(updated_params) {
					updated_params.compilation_id = updated_params.compilation_id.toString()
					t._updateTaskFile(baton, updated_params.compilation_id, params.timestamps, params.logo, function() {
						baton.callOrigCallback({
							compilation_id: updated_params.compilation_id,
							compilation_name: updated_params.compilation_name
						})
					})
				})
			})
		})
	},
	_readTaskFile(baton, callback) {
		fs.readFile(TASK_FILE_PATH, function(err, data) {
			if (err) {
				baton.setError({
					err: err.toString(),
					details: "Cannot read the task file ",
					task_file: TASK_FILE_PATH,
					public_message: 'Internal Error :  Could not put compilation video creation in queue'
				})
				baton.throwError()
				return
			} else callback((data == '' ? JSON.parse('{}') : JSON.parse(data)))
		})
	},

	_updateTaskFile(baton, comp_id, timestamps, logo, callback) {
		var t = this;

		function createSubTimestamps(ts, callback) {
			var subTimestamps = []
			while (ts.duration > SUB_TIMESTAMP_DURATION) {
				subTimestamps.push({
					episode_id: ts.episode_id,
					start_time: ts.start_time,
					duration: SUB_TIMESTAMP_DURATION,
					episode_name: ts.episode_name
				})
				if (ts.duration > SUB_TIMESTAMP_DURATION) {
					ts.start_time += SUB_TIMESTAMP_DURATION
					ts.duration -= SUB_TIMESTAMP_DURATION
				}
			};
			subTimestamps.push(ts)
			callback(subTimestamps)
		}

		function breakUpTimestamps(timestamps, callback) {
			var newTimestamps = []
			let breakUp = timestamps.forEach(function(ts) {
				createSubTimestamps(ts, function(subTimestamps) {
					newTimestamps = newTimestamps.concat(subTimestamps)
					if (timestamps.indexOf(ts) == timestamps.length - 1) callback(newTimestamps)
				})
			})
		}

		function updateTaskFile(currentTasks, timestamps, callback) {
			currentTasks[comp_id] = {
				timestamps: timestamps
			}
			if (logo) {
				currentTasks[comp_id].branding = {
					logo: logo
				}
			}
			fs.writeFile(TASK_FILE_PATH, JSON.stringify(currentTasks), function(err) {
				if (err) {
					baton.setError({
						err: err.toString(),
						details: "Cannot write/update to the task file ",
						task_file: TASK_FILE_PATH,
						public_message: 'Internal Error :  Could not put compilation video creation in queue'
					})
					baton.throwError()
					return
				} else callback()
			})
		}
		breakUpTimestamps(timestamps, function(newTimestamps) {
			t._readTaskFile(baton, function(data) {
				updateTaskFile(data, newTimestamps, callback)
			})
		})

	},

	_readDownloadTaskFile(baton,callback){
		fs.readFile(DOWNLOAD_TASK_FILE_PATH, function(err, data) {
			if (err) {
				baton.setError({
					err: err.toString(),
					details: "Cannot read the download task file ",
					task_file: DOWNLOAD_TASK_FILE_PATH,
					public_message: 'Internal Error :  Could not put compilation video creation in queue'
				})
				baton.throwError()
				return
			} else callback((data == '' ? JSON.parse('{\"tasks\":[]}') : JSON.parse(data)))
		})
	},

	_updateDownloadTaskFile(baton, params, callback){
		var t = this
		t._readDownloadTaskFile(baton, function(download_tasks){
			download_tasks.tasks.push({youtube_link: params.youtube_link, episode_id : params.episode_id})
			fs.writeFile(DOWNLOAD_TASK_FILE_PATH, JSON.stringify(download_tasks), function(err) {
				if (err) {
					baton.setError({
						err: err.toString(),
						details: "Cannot write/update to the download task file ",
						task_file: DOWNLOAD_TASK_FILE_PATH,
						public_message: 'Internal Error :  Could not update download task into queue'
					})
					baton.throwError()
					return
				} else callback()
			})
		})
	},

	get_CompilationVideoStatus(params, orig_callback) {
		var t = this
		var baton = t._getBaton("get_CompilationVideoStatus", null, orig_callback);

		params.compilation_id = params.compilation_id.toString()

		taskScript.getStatus(params.compilation_id, function(status) {
			if (status.completed) {
				t._assertCompilationIdExists(baton, params.compilation_id, function() {
					baton.callOrigCallback(status)
				})
				return
			}
			baton.callOrigCallback(status)
		})

	},

	//download video
	get_downloadCompilation(params, res, orig_callback) {
		var t = this
		var baton = t._getBaton("get_CompilationVideo", null, orig_callback);

		t._assertCompilationIdExists(baton, params.compilation_id, function(comp_path) {
			baton.orig_callback = function(data) {
				res.download(data);
			}
			baton.callOrigCallback(comp_path)
		})

	},

	_assertCompilationIdExists(baton, comp_id, callback) {
		var t = this
		baton.addMethod('_assertCompilationIdExists')

		function dataLoader(callback) {
			t._getAllCompilationVideos(baton, function(comp_videos) {
				callback(comp_videos)
			})
		}

		function validate(comp_id, comp_videos, callback) {
			if (comp_id == undefined) {
				baton.setError({
					compilation_id: comp_id,
					public_message: 'Invalid compilation id: compilation does not exist'
				})
				baton.throwError()
				return
			} else if (!comp_videos.map(function(comp) {
					return comp[0]
				}).includes(comp_id.toString())) {
				baton.setError({
					compilation_id: comp_id,
					public_message: 'Invalid compilation id: compilation does not exist'
				})
				baton.throwError()
				return
			}
			callback(COMPILATION_FOLDER + "/" + comp_id + ".mp4")
		}

		dataLoader(function(comp_videos) {
			validate(comp_id, comp_videos, function(full_compilation_path) {
				callback(full_compilation_path)
			})
		})
	},

	_assertLogoExists(baton, logo_name, callback) {
		this._getAllLogos(baton, function(logo_files) {
			if (!logo_files.map(file => {
					return file[0]
				}).includes(logo_name)) {
				baton.setError({
					logo_name: logo_name,
					public_message: 'Invalid logo : logo name does not exist'
				})
				baton.throwError()
				return
			}
			callback()
		})

	},

	_getEpisodeData(baton, callback) {
		var t = this;
		baton.addMethod('_getEpisodeData')

		var options = {
			hostname: cred.TIMESTAMP_SERVER_URL,
			path: '/getEpisodeData',
			method: 'GET',
			port: 443
		}

		var req = https.request(options, function(res) {
			res.on('data', function(data) {
				var parsedData = JSON.parse(Buffer.from(data).toString());
				if (res.statusCode == 200) {
					callback(parsedData)
				} else {
					baton.setError(parsedData)
					baton.throwError(true /*keepErrorMessage*/ )
					return
				}
			});
		}).on('error', function(err) {
			baton.setError({
				timestamp_server_error: err.toString(),
				error_details: 'Error from making https call to episode data'
			})
			baton.throwError()
			return
		})
		req.end()
	},

	_postCompilation(baton, params, callback) {
		var t = this;
		baton.addMethod('_postCompilation')

		var options = {
			hostname: cred.TIMESTAMP_SERVER_URL,
			path: '/newCompilation',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			port: 443
		}
		var req = https.request(options, function(res) {
			res.on('data', function(data) {
				var parsedData = JSON.parse(Buffer.from(data).toString());
				if (res.statusCode == 201) {
					callback(parsedData)
				} else {
					baton.setError(parsedData)
					baton.throwError(true /*keepErrorMessage*/ )
					return
				}
			});
		}).on('error', function(err) {
			baton.setError({
				timestamp_server_error: err.toString(),
				error_details: 'Error from making https call to create compilation'
			})
			baton.throwError()
			req.end()
		})

		req.write(JSON.stringify(params))
		req.end()
	},

	/**
	 * Creates the 'baton' object holding all general info for the session functions
	 * Original Callback will be stored, and method sequence will be stored, along with error
	 * uses 'call-by-sharing' ; like call-by-reference, but only for properties of objects
	 */
	_getBaton(method, params, orig_callback, response) {
		var t = this;
		var time = new Date();
		return {
			//id to reference detail log
			id: this._generateId(10),
			start_time: time.getTime(),
			err: [],
			//the original callback set in 'post' / 'get' endpoint calls
			orig_callback: orig_callback,
			callOrigCallback: function(data) {
				var end_time = new Date()
				this.duration = end_time.getTime() - this.start_time
				console.log(this.methods[0] + " | " + this.duration)
				this.orig_callback(data)
			},
			params: params,
			//method sequence
			methods: [method],
			addMethod: function(meth) {
				this.methods.push(meth)
			},
			//the error object & public message to display
			setError: function(error) {
				var end_time = new Date()
				this.duration = end_time.getTime() - this.start_time
				this.err.push(JSON.stringify( error));
			},
			throwError: function(keepErrorMessage) {
				t._generateError(this, keepErrorMessage)
			}
		}
	},


	_generateError(baton, keepErrorMessage) {
		var response = (keepErrorMessage ? JSON.parse(baton.err[0]) : {
			'id': baton.id,
			'error_message': baton.err.map(function(error) {
				return (JSON.parse(error).public_message ? JSON.parse(error).public_message : 'An internal error has occured')
			}).join('.')
		});
		baton.orig_callback(response)
		delete baton.orig_callback
		delete baton.addMethod
		delete baton.setError
		delete baton.throwError
		delete baton.callOrigCallback
		console.log('----------------')
		console.log(JSON.stringify(baton))
		console.log()
	},

	_generateServerError(err) {
		console.log('----------------')
		console.log(err)
		console.log()
	},

	_generateId(length, ids) {
		var id = (Math.pow(10, length - 1)) + Math.floor(+Math.random() * 9 * Math.pow(10, (length - 1)));
		if (ids) {
			while (ids.includes(id)) {
				id = (Math.pow(10, length - 1)) + Math.floor(+Math.random() * 9 * Math.pow(10, (length - 1)));
			}
		}
		return id;
	},


	_returnError(callback, msg) {
		callback({
			'error': msg
		})
	}
}