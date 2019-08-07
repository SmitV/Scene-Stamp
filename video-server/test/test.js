var assert = require('assert');
const expect = require('chai').expect;
var sinon = require('sinon')

var mockFs = require('mock-fs')
var fs = require('fs')

var action = require('../action')
var taskScript = require('../taskScript')



describe('tests', function() {



	var sandbox;
	var mockFileSystemData;
	var fakeBaton;
	var mockEpisodeData

	var {
		ROOT_DIR,
		UNLINKED_FOLDER,
		LINKED_FOLDER,
		COMPILATION_FOLDER
	} = taskScript.getAllDirectories();

	var SUB_TIMESTAMP_DURATION = 10;

	function sucsessResponse(response) {
		expect(response.error_message).to.equal(undefined);
	}

	function createSubTimestamps(ts, callback) {
		var subTimestamps = []
		ts.episode_name = ts.episode_id.toString() + '.mp4'
		while (ts.duration > SUB_TIMESTAMP_DURATION) {
			subTimestamps.push({
				episode_id: ts.episode_id,
				start_time: ts.start_time,
				duration: SUB_TIMESTAMP_DURATION,
				episode_name: ts.episode_id.toString() + '.mp4'
			})
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
			costructedTask[params.compilation_name] = {
				timestamps: newTasks
			}
			callback(costructedTask)
		})

	}

	beforeEach(function() {
		sandbox = sinon.createSandbox();

		//repress the console log 
		sandbox.stub(console, 'log').callsFake(() => {})

		fakeBaton = {
			methods: [],
			addMethod: function(method) {
				this.methods.push(method)
			}
		}

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

		sandbox.stub(action, '_getEpisodeData').callsFake((baton, callback) => {
			callback(mockEpisodeData)
		})

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

	describe('linking episode ', function() {

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

	describe('create compilation', function() {

		it('should update task file with compilation tasks', function() {
			var params = {
				compilation_name: "InTest Compilation",
				timestamps: [{
					episode_id: 0,
					start_time: 2,
					duration: 33
				}, {
					episode_id: 0,
					start_time: 10,
					duration: 20
				}]

			}
			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				tasksForCompilation(params, (content) => {
					expect(JSON.parse(mockFileSystemData['tasks.json'])[params.compilation_name]).to.deep.equal(content[params.compilation_name]);
					sucsessResponse(result)
				})
			})

		})

		it('with existing tasks, should update task file, with compilation tasks', function() {
			var existingTimestampParams = {
				compilation_name: "InTest Existing Compilation",
				timestamps: [{
					episode_id: 0,
					start_time: 2,
					duration: 13
				}, {
					episode_id: 0,
					start_time: 10,
					duration: 20
				}]
			}

			var params = {
				compilation_name: "InTest Compilation",
				timestamps: [{
					episode_id: 1,
					start_time: 90,
					duration: 13
				}, {
					episode_id: 0,
					start_time: 3,
					duration: 19
				}, {
					episode_id: 0,
					start_time: 300,
					duration: 5
				}]
			}

			function setUpExistingTasks(callback) {
				tasksForCompilation(JSON.parse(JSON.stringify(existingTimestampParams)), function(content) {
					console.log('done creating existing timestamps')
					mockFileSystemData['tasks.json'] = JSON.stringify(content)
					mockFs(mockFileSystemData)
					callback(content)
				})
			}

			setUpExistingTasks(function(existingTaskContent) {
				action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
					tasksForCompilation(params, (content) => {
						var taskFileContent = JSON.parse(mockFileSystemData['tasks.json'])
						expect(taskFileContent[existingTimestampParams.compilation_name]).to.deep.equal(existingTaskContent[existingTimestampParams.compilation_name]);
						expect(taskFileContent[content.compilation_name]).to.deep.equal(content[content.compilation_name]);
						sucsessResponse(result)
					})
				})
			})

		})

		it('should throw invalid param; compilation name', function(){
			var params = {
				timestamps: [{
					episode_id: 1,
					start_time: 90,
					duration: 13
				}]
			}

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				console.log(result)
				expect(result.error_message).to.equal('Invalid Params: compilation name')
			})
		})

		it('should throw invalid param; timestamp missing', function(){
			var params = {
				compilation_name:'InTest Compilation',
				timestamps: []
			}

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				console.log(result)
				expect(result.error_message).to.equal('Invalid Params: timestamps')
			})
		})

		it('should throw invalid param; invalid episode id', function(){
			var params = {
				compilation_name:'InTest Compilation',
				timestamps: [{
					episode_id: 101,//invalid episode id
					start_time: 90,
					duration: 13
				}]
			}

			action.get_CreateCompilation(JSON.parse(JSON.stringify(params)), function(result) {
				console.log(result)
				expect(result.error_message).to.equal('Invalid Params: episode id not present on server')
			})
		})



		//invalid params ; compilation(invalid, already there) , timestamps(invalid episode id, )
	})
})