var https = require('https')
var fs = require('fs')
var ffmetadata = require("ffmetadata");

var cred = require('./credentials.js')
var taskScript = require('./taskScript')

var TASK_FILE_PATH = './tasks.json'

var UNLINKED_FOLDER = './unlinked_videos'
var LINKED_FOLDER = './videos'
var COMPILATION_FOLDER = './compilations'


module.exports = {

	get_linkVideoToEpisode(params, orig_callback) {
		var t = this;
		var baton = t._getBaton("get_linkVideoToEpisode", params, orig_callback);

		function dataLoader(callback) {
			t._getAllUnlinkedVideos(baton, function(unlinked_videos) {
				t._getAlLinkedVideos(baton, function(linked_videos) {
					t._getEpisodeData(baton, function(episode_data) {
						callback(unlinked_videos, linked_videos, episode_data)
					});
				});
			});
		}

		function validate(params, unlinked_vids, linked_videos, episode_data, callback) {
			//NEED to check if the episode id is valid by calling timestamp server
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
				}).includes(params.episode_id)) {
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
				file_linked: params.episode_id,
				file_name: newFile
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
		fs.readdir(UNLINKED_FOLDER, (err, files) => {
			if (err) {
				baton.setError({
					error: err,
					public_message: "An Internal Error has occured"
				})
				baton.throwError()
			}
			callback(files.map(function(file) {
				return [file.split('.')[0], file.split('.')[1]]
			}))
		})
	},

	_getAlLinkedVideos(baton, callback) {
		baton.addMethod("_getAlLinkedVideos")
		fs.readdir(LINKED_FOLDER, (err, files) => {
			if (err) {
				baton.setError({
					error: err,
					public_message: "An Internal Error has occured"
				})
				baton.throwError()
			}
			callback(files.map(function(file) {
				return [file.split('.')[0], file.split('.')[1]]
			}))
		})
	},
	_getAllCompilationVideos(baton, callback) {
		baton.addMethod("_getAllCompilationVideos")
		fs.readdir(COMPILATION_FOLDER, (err, files) => {
			if (err) {
				baton.setError({
					error: err,
					public_message: "An Internal Error has occured"
				})
				baton.throwError()
			}
			callback(files.map(function(file) {
				return [file.split('.')[0], file.split('.')[1]]
			}))
		})
	},

	get_allUnlinkedVideos(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allUnlinkedVideos", null, orig_callback);

		this._getAllUnlinkedVideos(baton, function(unlinked_videos) {
			unlinked_videos.forEach(function(file) {
				console.log(file)
			})
			baton.callOrigCallback(unlinked_videos.map(function(file) {
				return {
					"file_name": file[0]
				}
			}))
		})
	},

	get_allLinkedVides(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allLinkedVides", null, orig_callback);

		this._getAlLinkedVideos(baton, function(linked_videos) {
			baton.callOrigCallback(linked_videos.map(function(file) {
				return {
					"file_name": file[0]
				}
			}))
		})
	},

	get_allCompilationVideos(orig_callback) {
		var t = this;
		var baton = t._getBaton("get_allCompilationVideos", null, orig_callback);

		this._getAllCompilationVideos(baton, function(comp_videos) {
			baton.callOrigCallback(comp_videos.map(function(file) {
				return {
					"file_name": file[0]
				}
			}))
		})
	},

	get_CreateCompilation(params, orig_callback) {
		var t = this;
		var baton = t._getBaton("get_CreateCompilation", params, orig_callback);


		function dataLoader(callback) {
			t._getAlLinkedVideos(baton, function(linked_videos) {
				t._getAllCompilationVideos(baton, function(compilation_videos) {
					callback(linked_videos, compilation_videos)
				})
			})
		}

		function validateCreateCompilationParams(linked_videos, compilation_videos, callback) {

			var errorOccur = false;
			if (compilation_videos.map(function(comp) {
					return comp[0].toLowerCase()
				}).includes(params.compilation_name.toLowerCase())) {
				baton.setError({
					compilation_name: params.compilation_name,
					public_message: "Invalid Params:compilation with same name exists"
				})
				baton.throwError()
				return
			}
			params.timestamps.forEach(function(el) {
				if (typeof el.episode_id !== 'number' || typeof el.start_time !== 'number' || typeof el.duration !== 'number') {
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
			callback()
		}

		dataLoader(function(linked_videos, compilation_videos) {
			validateCreateCompilationParams(linked_videos, compilation_videos, function() {
				t._updateTaskFile(baton, params.compilation_name, params.timestamps, function() {
					baton.callOrigCallback({
						compilation_name: params.compilation_name
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

	_updateTaskFile(baton, comp_name, timestamps, callback) {
		var t = this;
		function updateTaskFile(currentTasks, callback) {
			currentTasks[comp_name] = {
				timestamps: timestamps
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

			t._readTaskFile(baton, function(data) {
				updateTaskFile(data, callback)
			})
	
	},

	get_CompilationVideo(params, res, orig_callback) {
		var t = this
		var baton = t._getBaton("getCompilationVideo", null, orig_callback);

		function dataLoader(callback) {
			t._getAllCompilationVideos(baton, function(comp_videos) {
				callback(comp_videos)
			})
		}

		function validateParams(params, compilation_videos, callback) {
			if (params.compilation_name == undefined) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: 'Invalid Params:compilation does not exist'
				})
				baton.throwError()
				return
			}
			if (!compilation_videos.map(function(comp) {
					return comp[0].toLowerCase()
				}).includes(params.compilation_name.toLowerCase())) {
				baton.setError({
					episode_id: params.episode_id,
					public_message: 'Invalid Params:compilation does not exist'
				})
				baton.throwError()
				return
			} else {
				callback(params.compilation_name)
			}
		}

		dataLoader(function(comp_videos) {
			validateParams(params, comp_videos, function(comp_name) {
				taskScript.getStatus(comp_name, function(status) {
					if (status.completed) {
						baton.orig_callback = function(file) {
							res.download(file)
						}
						baton.callOrigCallback(COMPILATION_FOLDER + '/' + comp_name + ".mp4")
					} else {
						baton.orig_callback(status)
					}
				})
			})
		})
	},

	_callVideoCut(source_file, compilation_video, start_time, duration, callback) {
		console.log('start ' + source_file)
		var spawn = require("child_process").spawn;
		var pythonProcess = spawn('python', ["video_cut.py", LINKED_FOLDER + "/" + source_file, COMPILATION_FOLDER + '/' + compilation_video, start_time, duration]);
		pythonProcess.stdout.on('data', function(data) {

			console.log("data :" + data);
		});

		pythonProcess.on('data', (data) => {

			console.log("error :" + data);
		});

		pythonProcess.stdout.on('exit', (code) => {
			console.log("Process quit with code : " + code);
			callback()
		});

		pythonProcess.on('exit', (code) => {
			console.log("Process quit with code : " + code);
			callback()
		});

	},

	_getEpisodeData(baton, callback) {
		var t = this;
		var req = https.get('https://scene-stamp-server.herokuapp.com/getEpisodeData', function(res) {
			res.on('data', function(chunk) {
				if (chunk.error_message) {
					baton.setError({
						timestamp_server_error: chunk,
						public_message: 'Internal Error Occured'
					})
					baton.throwError()
				}
				callback(JSON.parse(chunk.toString()))
			});
		});
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
			//method sequence
			methods: [method],
			addMethod: function(meth) {
				this.methods.push(meth)
			},
			//the error object & public message to display
			setError: function(error) {
				var end_time = new Date()
				this.duration = end_time.getTime() - this.start_time
				this.err.push(error);
			},
			throwError: function() {
				t._generateError(this)
			}
		}
	},


	_generateError(baton) {
		console.log('----------------')
		console.log(baton)
		console.log()
		var response = {
			'id': baton.id,
			'error_message': baton.err.map(function(err) {
				return err.public_message
			}).join('.'),
			'method_seq': baton.methods
		};
		baton.orig_callback(response)
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