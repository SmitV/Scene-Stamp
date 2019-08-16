var assert = require('assert');
const expect = require('chai').expect;
var sinon = require('sinon')
var events = require('events')
var child_process = require('child_process')

var mockFs = require('mock-fs')
var fs = require('fs')
var nock = require('nock')

var action = require('../action')
var taskScript = require('../taskScript')
var cred = require('../credentials.js')



describe('tests', function() {



	var sandbox;
	var mockFileSystemData;
	var fakeBaton;
	var mockEpisodeData;
	var existingTimestampParams;

	var universalCompilationId;


	var {
		ROOT_DIR,
		UNLINKED_FOLDER,
		LINKED_FOLDER,
		COMPILATION_FOLDER,
		BRANDING_FOLDER
	} = taskScript.getAllDirectories();

	var SUB_TIMESTAMP_DURATION = 10;

	function sucsessResponse(response) {
		expect(response.error_message).to.equal(undefined);
	}

	function createSubTimestamps(ts, callback) {
		var subTimestamps = []
		ts.episode_name = ts.episode_id.toString() + '.mp4'
		while (ts.duration > SUB_TIMESTAMP_DURATION) {
			var data = {
				episode_id: ts.episode_id,
				start_time: ts.start_time,
				duration: SUB_TIMESTAMP_DURATION,
				episode_name: ts.episode_id.toString() + '.mp4',
			}
			if (ts.completed != undefined) data.completed = ts.completed
			subTimestamps.push(data)
			if (ts.duration > SUB_TIMESTAMP_DURATION) {
				ts.start_time += SUB_TIMESTAMP_DURATION
				ts.duration -= SUB_TIMESTAMP_DURATION
			}
		};
		subTimestamps.push(ts)
		callback(subTimestamps)
	}

	function createTasksFromTimestamp(timestamps, callback) {
		var newTimestamps = []
		let breakUp = timestamps.forEach(function(ts) {
			createSubTimestamps(ts, function(subTimestamps) {
				newTimestamps = newTimestamps.concat(subTimestamps)
				if (timestamps.indexOf(ts) == timestamps.length - 1) callback(newTimestamps)
			})
		})
	}

	function tasksForCompilation(params, callback) {
		createTasksFromTimestamp(params.timestamps, (newTasks) => {
			var costructedTask = {}
			costructedTask[params.compilation_id] = {
				timestamps: newTasks
			}
			if(params.logo){
				costructedTask[params.compilation_id].branding = {
					logo : params.logo
				}
			}
			if (params.error) costructedTask[params.compilation_id].error = params.error
			callback(costructedTask)
		})

	}

	beforeEach(function() {

		sandbox = sinon.createSandbox();

		taskScript._resetCurrentTasks()

		//repress the console log 
		sandbox.stub(console, 'log').callsFake(() => {})

		fakeBaton = {
			methods: [],
			addMethod: function(method) {
				this.methods.push(method)
			}
		}

		//mock data create compilation params
		existingTimestampParams = {
			compilation_name: "InTest Existing Compilation",
			timestamps: [{
				episode_id: 1,
				start_time: 2,
				duration: 13,
				timestamp_id: 1
			}, {
				episode_id: 1,
				start_time: 10,
				duration: 20,
				timestamp_id: 1
			}]
		}

		//mock timestamp server calls

		//mock the timestamp episode data
		mockEpisodeData = [{
			episode_id: 0
		}, {
			episode_id: 1
		}, {
			episode_id: 2
		}, {
			episode_id: 3
		}]

		universalCompilationId = 1057

		function addUniversalCompilationId(){
			var data = JSON.parse(JSON.stringify(existingTimestampParams))
			data.compilation_id = universalCompilationId
			return data
		}

		//episode data
		nock('https://'+cred.TIMESTAMP_SERVER_URL).get('/getEpisodeData').reply(200, mockEpisodeData)

		nock('https://'+cred.TIMESTAMP_SERVER_URL).post('/newCompilation').reply(201, addUniversalCompilationId(existingTimestampParams))





		//mock the file system 
		mockFileSystemData = {
			'tasks.json': '{}'
		}

		mockFileSystemData[UNLINKED_FOLDER] = {
			'unlinked_vid_1.mp4': 'unlinked vid 1',
			'unlinked_vid_2.mp4': 'unlinked vid 2',
			'unlinked_vid_3.mp3': 'unlinked vid 3',
		}
		mockFileSystemData[LINKED_FOLDER] = {
			'0.mp4': 'episode 0 file ',
			'1.mp4': 'episode 1 file  ',
		}
		mockFileSystemData[COMPILATION_FOLDER] = {
			'compilation_vid_1.mp4': 'compilation 1 file ',
			'compilation_vid_2.mp4': 'compilation 2 file ',
		}
		mockFileSystemData[BRANDING_FOLDER] = {
			'test-brand-logo.png': 'test brand logo ',
		}

		mockFs(mockFileSystemData)

		function getDirAndFile(file) {
			var fileArray = file.split('/')
			var fileName = fileArray.pop();
			return [fileArray.join('/'), fileName]
		}

		//mocking the fs renaming 
		sandbox.stub(fs, 'rename').callsFake(function(oldFile, newFile, callback) {
			var oldInfo = getDirAndFile(oldFile)
			var newInfo = getDirAndFile(newFile)
			mockFileSystemData[newInfo[0]][newInfo[1]] = mockFileSystemData[oldInfo[0]][oldInfo[1]]
			delete mockFileSystemData[oldInfo[0]][oldInfo[1]]
			mockFs(mockFileSystemData)
			callback()
		})

		//mocking the fs writing to file  
		sandbox.stub(fs, 'writeFile').callsFake(function(file, content, callback) {
			var fileInfo = getDirAndFile(file)
			if (fileInfo[0] == ".") mockFileSystemData[fileInfo[1]] = content
			else mockFileSystemData[fileInfo[0]][fileInfo[1]] = content
			mockFs(mockFileSystemData)
			callback()
		})

	})

	afterEach(function() {
		sandbox.restore();
		mockFs.restore();
		nock.cleanAll()
	})

	it('should mock file system', function() {
		action._getAllUnlinkedVideos(fakeBaton, (unlinked_videos) => {
			var files = []
			Object.keys(mockFileSystemData[UNLINKED_FOLDER]).forEach(function(key) {
				files.push(key.split('.'))
			});
			expect(unlinked_videos).to.deep.equal(files)
		})

		action._getAllLinkedVideos(fakeBaton, (linked_videos) => {
			var files = []
			Object.keys(mockFileSystemData[LINKED_FOLDER]).forEach(function(key) {
				files.push(key.split('.'))
			});
			expect(linked_videos).to.deep.equal(files)
		})

		action._getAllCompilationVideos(fakeBaton, (compilation_videos) => {
			var files = []
			Object.keys(mockFileSystemData[COMPILATION_FOLDER]).forEach(function(key) {
				files.push(key.split('.'))
			});
			expect(compilation_videos).to.deep.equal(files)
		})
	})

	context('linking episode ', function() {

		it('should link unlinked video to episode', function() {
			var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]
			var params = {
				unlinked_video: unlinkedVideoName.split('.')[0],
				episode_id: mockEpisodeData[2].episode_id
			}
			var origFileContent = mockFileSystemData[UNLINKED_FOLDER][Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]]
			action.get_linkVideoToEpisode(params, function(result) {
				action._getAllUnlinkedVideos(fakeBaton, (linked_videos) => {
					expect(mockFileSystemData[UNLINKED_FOLDER][params.unlinked_video]).to.equal(undefined);
				})
				expect(result.episode_id_linked).to.equal(params.episode_id);
				expect(mockFileSystemData[LINKED_FOLDER][params.episode_id + '.mp4']).to.equal(origFileContent)
				sucsessResponse(result)
			})
		})

		it('should throw for error in getEpisodeData call', function() {
			var error = {
				id: 101,
				error: 'InTest Timestamp Error'
			};
			nock.cleanAll()
			nock('https://'+cred.TIMESTAMP_SERVER_URL).get('/getEpisodeData').reply(500, error)
			var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]
			var params = {
				unlinked_video: unlinkedVideoName.split('.')[0],
				episode_id: mockEpisodeData[2].episode_id
			}
			action.get_linkVideoToEpisode(params, function(result) {
				expect(result).to.deep.equal(error)
			})

		})

		it('should throw for invalid unlinked video', function() {
			var unlinkedVideoName = 'Random Unlinked Video'
			var params = {
				unlinked_video: unlinkedVideoName,
				episode_id: mockEpisodeData[2].episode_id
			}
			action.get_linkVideoToEpisode(params, function(result) {
				expect(result.error_message).to.equal('Invalid Params : unlinked video does not exist')
			})

		})

		it('should throw for invalid episode id', function() {
			var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]
			var params = {
				unlinked_video: unlinkedVideoName.split('.')[0],
				episode_id: 101
			}
			action.get_linkVideoToEpisode(params, function(result) {
				expect(result.error_message).to.equal('Invalid Params Episode Id: invalid id')
			})

		})

		it('should throw for already linked episode id', function() {
			var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]
			var params = {
				unlinked_video: unlinkedVideoName.split('.')[0],
				episode_id: mockEpisodeData[0].episode_id
			}
			action.get_linkVideoToEpisode(params, function(result) {
				expect(result.error_message).to.equal('Invalid Params Episode Id: already linked to video')
			})

		})

		it('should throw for unlinked video that is not in mp4 format', function() {
			var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[2]
			var params = {
				unlinked_video: unlinkedVideoName.split('.')[0],
				episode_id: mockEpisodeData[2].episode_id
			}
			action.get_linkVideoToEpisode(params, function(result) {
				expect(result.error_message).to.equal('Invalid Params Unlinked Video: file must be in mp4 format')
			})

		})

	})

	context('create compilation', function() {

		it('should update task file with compilation tasks', function(done) {
			var params = existingTimestampParams

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				params.compilation_id = universalCompilationId
				tasksForCompilation(params, (content) => {
					expect(JSON.parse(mockFileSystemData['tasks.json'])[params.compilation_id]).to.deep.equal(content[params.compilation_id]);
					sucsessResponse(result)
					done()
				})
			})
		})

		it('should update task file with compilation tasks and branding', function(done) {
			var params = existingTimestampParams
			params.logo = "test-brand-logo"

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				params.compilation_id = universalCompilationId
				tasksForCompilation(params, (content) => {
					expect(JSON.parse(mockFileSystemData['tasks.json'])[params.compilation_id]).to.deep.equal(content[params.compilation_id]);
					sucsessResponse(result)
					done()
				})
			})
		})

		it('with existing tasks, should update task file, with compilation tasks', function(done) {

			var params = existingTimestampParams

			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function(existingTaskContent) {
				action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
					tasksForCompilation(params, (content) => {
						var taskFileContent = JSON.parse(mockFileSystemData['tasks.json'])
						expect(taskFileContent[existingTimestampParams.compilation_id]).to.deep.equal(existingTaskContent[existingTimestampParams.compilation_id]);
						expect(taskFileContent[content.compilation_id]).to.deep.equal(content[content.compilation_id]);
						sucsessResponse(result)
						done()
					})
				})
			})
		})

		it('should throw invalid param; compilation name', function(done) {
			var params = existingTimestampParams
			delete params.compilation_name

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				expect(result.error_message).to.equal('Invalid Params: compilation name')
				done()
			})
		})

		it('should throw invalid param; timestamp missing', function(done) {
			var params = existingTimestampParams
			params.timestamps = []


			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				expect(result.error_message).to.equal('Invalid Params: timestamps')
				done()
			})
		})

		it('should throw invalid param; invalid episode id', function(done) {
			var params = existingTimestampParams
			params.timestamps[0].episode_id = 101 //episode id not in linked folder

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				expect(result.error_message).to.equal('Invalid Params: episode id not present on server')
				done()
			})
		})

		it('should throw invalid param; invalid logo', function(done) {
			var params = existingTimestampParams
			params.logo = "invalid-logo"

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				expect(result.error_message).to.equal('Invalid logo : logo name does not exist')
				done()
			})
		})

	})

	//compilation video status 

	context('compilation video status', function() {

		it('should get compilation video status (incomplete)', function(done) {

			existingTimestampParams.timestamps[0].completed = true
			existingTimestampParams.compilation_id = universalCompilationId

			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function() {
				action.get_CompilationVideoStatus({
					compilation_id: existingTimestampParams.compilation_id
				}, function(result) {
					sucsessResponse(result)
					expect(result.completed).to.equal(false)
					expect(result.percentage).to.equal(0.5);
					done()
				})
			})
		})

		it('should get compilation video status (complete)', function(done) {

			existingTimestampParams.timestamps[0].completed = true
			existingTimestampParams.timestamps[1].completed = true
			existingTimestampParams.compilation_id = universalCompilationId


			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function() {
				action.get_CompilationVideoStatus({
					compilation_id: existingTimestampParams.compilation_id
				}, function(result) {
					sucsessResponse(result)
					// even if the percentage is 100, we only update completed in the 'updateTask' taskScript function
					expect(result.completed).to.equal(false)
					expect(result.percentage).to.equal(1);
					done()
				})
			})
		})

		it('should get compilation video status with branding (incomplete)', function(done) {

			existingTimestampParams.timestamps[0].completed = true
			existingTimestampParams.timestamps[1].completed = true
			existingTimestampParams.compilation_id = universalCompilationId
			existingTimestampParams.logo = "test-brand-logo"

			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function() {
				action.get_CompilationVideoStatus({
					compilation_id: existingTimestampParams.compilation_id
				}, function(result) {
					sucsessResponse(result)
					expect(result.completed).to.equal(false)
					expect(result.percentage).to.equal(4/5);
					done()
				})
			})
		})

		it('should get compilation video status with branding (complete)', function(done) {

			existingTimestampParams.timestamps[0].completed = true
			existingTimestampParams.timestamps[1].completed = true
			existingTimestampParams.compilation_id = universalCompilationId
			existingTimestampParams.logo = "test-brand-logo"

			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					content[universalCompilationId].branding.completed = true
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function() {
				action.get_CompilationVideoStatus({
					compilation_id: existingTimestampParams.compilation_id
				}, function(result) {
					sucsessResponse(result)
					expect(result.completed).to.equal(false)
					expect(result.percentage).to.equal(1);
					done()
				})
			})
		})

		it('should throw invalid param; invalid compilation id', function(done) {

			var compilation_id = 111 //wrong compilation id
			action.get_CompilationVideoStatus({
				compilation_id : compilation_id
			}, function(result) {
				expect(result.error_message).to.equal('Invalid compilation id: compilation does not exist')
				done()
			})

		})

	})

	context('update task ', function() {

		async function runUpdateTasks(callback) {
			taskScript.updateTasks()
			setTimeout(callback, 100)
		}

		function setUpExistingTasks(callback) {
			tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
				mockFileSystemData['tasks.json'] = JSON.stringify(content)
				mockFs(mockFileSystemData)
				callback(content)
			})
		}

		function setUpTasksAndRunUpdateTasks(callback) {
			setUpExistingTasks(tasks => {
				runUpdateTasks(function() {
					callback(tasks)
				});
			})
		}
		var videoCutSpy;
		var videoLogoSpy;

		var childSpawnEmitter;

		function setUpSpawnEmitter() {
			childSpawnEmitter.stdout = new events.EventEmitter();
			childSpawnEmitter.stderr = new events.EventEmitter();
			childSpawnEmitter.kill = function() {
				console.log('process DEAD')
			}
			sandbox.stub(child_process, 'spawn').returns(childSpawnEmitter);
		}

		function emit(event, output) {
			if (event == 'error') childSpawnEmitter.stderr.emit('data', output)
			else childSpawnEmitter.stdout.emit('data', output);
		}

		beforeEach(function() {
			existingTimestampParams.timestamps[0].completed = true

			videoCutSpy = null

			videoLogoSpy = null;

			childSpawnEmitter = new events.EventEmitter();

			existingTimestampParams.compilation_id = universalCompilationId

		})

		function setUpSpy() {
			videoCutSpy = sandbox.stub(taskScript, '_callVideoCut').callsFake(function() {})
			videoLogoSpy = sandbox.stub(taskScript, '_callVideoLogo').callsFake(function(){})
		}

		it('should run video cut on next incomplete task', function(done) {
			setUpSpy();

			setUpTasksAndRunUpdateTasks((tasks) => {
				var timestampTask = tasks[existingTimestampParams.compilation_id].timestamps.find(function(task) {
					return !task.completed
				})
				expect(videoCutSpy.calledOnce).to.equal(true)
				expect(taskScript._getCurrentTasks().includes(existingTimestampParams.compilation_id.toString())).to.equal(true)
				expect(videoCutSpy.getCall(0).args).to.deep.equal([timestampTask.episode_id.toString() + '.mp4', existingTimestampParams.compilation_id.toString(), timestampTask.start_time, timestampTask.duration, tasks[existingTimestampParams.compilation_id].timestamps.indexOf(timestampTask)])
				done()
			})
		})

		it('should run video logo on next incomplete task', function(done) {
			setUpSpy();
			existingTimestampParams.timestamps[1].completed = true
			existingTimestampParams.logo = "test-brand-logo"

			setUpTasksAndRunUpdateTasks((tasks) => {
				var timestampTask = tasks[existingTimestampParams.compilation_id].timestamps.find(function(task) {
					return !task.completed
				})
				expect(videoLogoSpy.calledOnce).to.equal(true)
				expect(taskScript._getCurrentTasks().includes(existingTimestampParams.compilation_id.toString())).to.equal(true)
				expect(videoLogoSpy.getCall(0).args).to.deep.equal([existingTimestampParams.compilation_id.toString(),"test-brand-logo"])
				done()
			})
		})


		it('should not run next task, since error exists ', function(done) {
			setUpSpy();
			existingTimestampParams.error = 'InTest Error'

			setUpTasksAndRunUpdateTasks(function(tasks) {
				expect(videoCutSpy.calledOnce).to.equal(false)
				expect(taskScript._getCurrentTasks().includes(existingTimestampParams.compilation_id)).to.equal(false)
				done()
			})
		})

		it('should not run video cut on next incomplete task, when compilation creation currently running', function(done) {
			setUpSpy();
			taskScript._pushTask(existingTimestampParams.compilation_id.toString())

			setUpTasksAndRunUpdateTasks((tasks) => {
				expect(videoCutSpy.calledOnce).to.equal(false)
				done()
			});
		})

		it('should remove task whose all timestamps are complete', function(done) {
			setUpSpy();
			existingTimestampParams.timestamps[1].completed = true

			setUpTasksAndRunUpdateTasks((tasks) => {
				expect(videoCutSpy.calledOnce).to.equal(false)
				expect(JSON.parse(mockFileSystemData['tasks.json'])[existingTimestampParams.compilation_name]).to.equal(undefined)
				done()
			})
		})

		it('should update the task file after video cut is finished', function(done) {
			setUpSpawnEmitter();
			setUpTasksAndRunUpdateTasks((tasks) => {
				var indexOfTaskToBeCompleted = tasks[existingTimestampParams.compilation_id].timestamps.indexOf(tasks[existingTimestampParams.compilation_id].timestamps.find(function(task) {
					return !task.completed
				}))
				var currentTaskCompletion = () => {
					return JSON.parse(mockFileSystemData['tasks.json'])[existingTimestampParams.compilation_id].timestamps[indexOfTaskToBeCompleted].completed
				}
				expect(currentTaskCompletion()).to.not.equal(true);
				childSpawnEmitter.emit('exit');
				setTimeout(() => {
					expect(currentTaskCompletion()).to.equal(true);
					done()
				}, 20)


			})
		})

		it('should update the task file after video logo is finished', function(done) {
			setUpSpawnEmitter();
			existingTimestampParams.timestamps[1].completed = true
			existingTimestampParams.logo = "test-brand-logo"

			setUpTasksAndRunUpdateTasks((tasks) => {
				
				var brandingTaskCompletion = () => {
					return JSON.parse(mockFileSystemData['tasks.json'])[existingTimestampParams.compilation_id].branding.completed
				}
				expect(brandingTaskCompletion()).to.not.equal(true);
				childSpawnEmitter.emit('exit');
				setTimeout(() => {
					expect(brandingTaskCompletion()).to.equal(true);
					done()
				}, 20)
			})
		})

		it('should update the task file with messages and error after video cut throws error', function(done) {
			setUpSpawnEmitter();
			setUpTasksAndRunUpdateTasks((tasks) => {
				var currentTaskError = () => {
					return JSON.parse(mockFileSystemData['tasks.json'])[existingTimestampParams.compilation_id].error
				}
				expect(currentTaskError()).to.equal(undefined);
				emit('data', 'InTest Data')
				emit('error', 'InTest Error')
				setTimeout(() => {
					expect(currentTaskError().messages).to.contain('InTest Data')
					expect(currentTaskError().err).to.contain('InTest Error');
					done()
				}, 20)

			})
		})

	})
})