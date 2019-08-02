var fs = require('fs')
var ps = require('python-shell')
var async = require('async')

var TASK_FILE_PATH = './tasks.json'

var ROOT_DIR = '/Users/kunal/Desktop/SSV/'
//var ROOT_DIR = '/home/ubuntu/'

var UNLINKED_FOLDER = ROOT_DIR + 'unlinkedVideos'
var LINKED_FOLDER = ROOT_DIR + 'episodeVideos'
var COMPILATION_FOLDER = ROOT_DIR + 'compilationVideos'

//var PYTHON_PATH = '/usr/bin/python'
var PYTHON_PATH = '/Users/kunal/anaconda2/bin/python'

var VIDEO_CUT_FILE = 'video_cut.py'
var TEST_PYTHON_FILE = 'testPython.py'

var currentTasks = []


/**
Python Child Processes - How they work

General Flow:
	-When a compilation video needs to be created, the empty file is created, and the 'task.json' file is updated to have the compilation_name and timestamps to add
		-all done during the api call
	-in interval in server, the 'updateTasks' is called
		-will read the tasks.json file ; if there are any new tasks, it will start creating the new comp video
		-process to create the comp video:
			0)the currentTasks var in this file will include the comp_name
				-indicated that specified compilation video is being created
			1)A timestamp is read form the comp_name in the tasks.json
			2)The python script is called to append the timestamp(section with start time and duration) to the empty comp_video file
			3)At the end, the timestamp will get new attr 'completed' = true
			4)The next timestamp is read, goto step 2
			5)once all timestamps have 'completed' attr, the comp_name is removed from tasks.json
		-in case the server stops while creating compilation video , there is an incomplete compilation video
			1)'updateTasks' will still get called , the first time will pass special flag
				-will get the total duration allready added by summing durations of all timestamps with completed 
			2)total complete duration will be passed to video_cut  , will remove all frames added by the last timestamp it was adding
			3) resume as normal, step 2 from above
		-in case error occurs from video_cut
			1) in 'tasks.json', comp_name will have attr 'error': err
			2) when 'updateTasks' is called, will not start process if error exists
*/

module.exports = {

	PYTHON_PATH: PYTHON_PATH,
	ROOT_DIR: ROOT_DIR,
	VIDEO_CUT_FILE: VIDEO_CUT_FILE,
	
	getAllDirectories(){
		return {ROOT_DIR, UNLINKED_FOLDER, LINKED_FOLDER, COMPILATION_FOLDER}
	},

	updateTasks() {
		var t = this

		function startTask(tasks, comp_name) {
			var timestamps = tasks[comp_name].timestamps
			if (timestamps.filter(function(ts) {
					return ts.completed != true
				}).length == 0) {
				t._updateRemoveCompFromTask(comp_name)
				return
			}
			for (var i = 0; i < timestamps.length; i++) {
				if (!timestamps[i].completed) {
					var ts = timestamps[i]
					currentTasks.push(comp_name)
					console.log('compilation started : ' + comp_name)
					t._callVideoCut(ts.episode_name, comp_name, ts.start_time, ts.duration, i)
					break
				}
			}
		}

		this._readTaskFile(function(tasks) {

			var tasksNotCurrentlyRunning = Object.keys(tasks).filter(function(comp_name) {
				return !currentTasks.includes(comp_name)
			}).filter(function(task) {
				return tasks[task].error == undefined
			});
			tasksNotCurrentlyRunning.forEach(function(comp_name) {
				startTask(tasks, comp_name)
			})
		})
	},


	_readTaskFile(callback) {
		var t = this;
		fs.readFile(TASK_FILE_PATH, function(err, data) {
			if (err) {
				t._throwError({
					err: err.toString(),
					details: "Cannot read the task file ",
					task_file: TASK_FILE_PATH,
					public_message: 'Internal Error :  Could not put compilation video creation in queue'
				})
				return
			} else callback((data == '' ? JSON.parse('{}') : JSON.parse(data)))
		})
	},

	_updateTaskFile(data, callback) {
		var t = this;
		fs.writeFile(TASK_FILE_PATH, JSON.stringify(data), function(err) {
			if (err) {
				t._throwError({
					err: err.toString(),
					details: "Cannot read the task file ",
					task_file: TASK_FILE_PATH,
					public_message: 'Internal Error :  Could not put compilation video creation in queue'
				})
				return
			} else callback()
		})
	},

	_updateRemoveCompFromTask(comp_name) {
		console.log('_updateRemoveCompFromTask')
		var t = this;
		t._readTaskFile(function(tasks) {
			delete tasks[comp_name]
			t._updateTaskFile(tasks, function() {
				console.log("Completed Compilation Creation : " + comp_name)
			})
		})
	},

	_updateErrorWithinTasks(comp_name, err) {
		console.log('_updateErrorWithinTasks')
		var t = this;
		t._readTaskFile(function(tasks) {
			tasks[comp_name].error = err
			t._updateTaskFile(tasks, function() {
				currentTasks.splice(currentTasks.indexOf(comp_name), 1)
			})
		})
	},

	_updateTimestampToComplete(comp_name, indexOfTimestamp, callback) {
		console.log('_updateTimestampToComplete')
		var t = this;
		t._readTaskFile(function(tasks) {
			tasks[comp_name].timestamps[indexOfTimestamp].completed = true
			t._updateTaskFile(tasks, function() {
				console.log("Finished adding timestamp # " + indexOfTimestamp + " to compilation video " + comp_name)
				callback()
			})
		})

	},

	_callVideoCut(source_file, compilation_video, start_time, duration, indexOfTimestamp) {
		var t = this

		var pythonMessages = []

		var comp_name = compilation_video.split('.')[0]
		var options = {
			mode: 'text',
			pythonPath: PYTHON_PATH,
			args: [LINKED_FOLDER + "/" + source_file, COMPILATION_FOLDER + '/' + compilation_video, start_time, duration]
		}

		function handleError(err) {
			t._updateErrorWithinTasks(comp_name, {
				messages: pythonMessages,
				err: err
			})
			t._throwError({
				messages: pythonMessages,
				err: err
			})
		}
		ps.PythonShell.run(VIDEO_CUT_FILE, options, function(err, data) {
			if (err) {
				handleError(err)
				return
			}
			pythonMessages.push('Video Cut Python On Start Callback')
		}).on('message', function(data) {
			pythonMessages.push(data)
		}).end(function(err, data) {
			if (err) {
				handleError(err)
				return
			}
			t._updateTimestampToComplete(comp_name, indexOfTimestamp, function() {
				currentTasks.splice(currentTasks.indexOf(comp_name), 1)
			})
		})
	},

	getStatus(comp_name, callback) {
		var t = this;

		t._readTaskFile(function(tasks) {
			if (tasks[comp_name] == undefined) {
				callback({
					completed: true
				})
			} else {
				var task = tasks[comp_name]
				if (task.error) {
					callback({
						completed: false,
						error: task.error
					})
					return
				}
				var countCompleted = task.timestamps.filter(function(ts) {
					return ts.completed == true
				}).length
				callback({
					completed: false,
					percentage: countCompleted / task.timestamps.length
				})
			}
		})
	},


	_throwError(data) {
		console.log('----AUTOMATED------')
		console.log(data)
		console.log('\n')
	},

	initialTests(callback) {

		this.callTestPythonScript(error => {
			if (!error) {
				this.checkDirectories(error => {
					callback(error)
				})
				return
			}
			callback(error)
		})

	},

	checkDirectories(suc_callback) {

		var tasks = []

		function checkDirExists(dir, callback) {
			fs.access(dir, error => {
				callback(error)
			})
		}

		tasks.push(function(callback) {
			checkDirExists(UNLINKED_FOLDER, callback);
		})
		tasks.push(function(callback) {
			checkDirExists(LINKED_FOLDER, callback);
		})
		tasks.push(function(callback) {
			checkDirExists(COMPILATION_FOLDER, callback);
		})

		async.parallel(tasks,
			err => {
				if (err) {
					this._throwError(err)
					suc_callback(err)
					return
				}
				suc_callback()
			})
	},

	/**
	 * Call to test python can run on server
	 * Will run before loops run on the server 
	 */

	callTestPythonScript(callback) {
		var t = this

		var pythonMessages = []
		var options = {
			mode: 'text',
			pythonPath: PYTHON_PATH,
		}

		function handleError(err) {
			t._throwError({
				messages: pythonMessages,
				err: err
			})
			callback(err)
		}
		ps.PythonShell.run(TEST_PYTHON_FILE, options, function(err, data) {
			if (err) {
				handleError(err)
				return
			}
			pythonMessages.push('Video Cut Python On Start Callback')
		}).on('error', err => {
			console.log('error has caught')
			handleError(err)
		}).on('message', function(data) {
			pythonMessages.push(data)
		}).end(function(err, data) {
			if (err) {
				handleError(err)
				return
			}
			callback()
		})
	},
}