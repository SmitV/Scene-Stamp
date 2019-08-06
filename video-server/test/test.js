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

	beforeEach(function() {
		sandbox = sinon.createSandbox();

		fakeBaton = {
			methods: [],
			addMethod: function(method) {
				this.methods.push(method)
			}
		}

		//mock the timestamp episode data
		mockEpisodeData = [{episode_id:0},{episode_id:1},{episode_id:2},{episode_id:3}]
		  
    	sandbox.stub(action, '_getEpisodeData').callsFake((baton, callback) => {
    		callback(mockEpisodeData)
    	})

		//mock the file system 
		mockFileSystemData = {}
		mockFileSystemData[UNLINKED_FOLDER] = {
			'unlinked_vid_1.mp4': 'unlinked vid 1',
			'unlinked_vid_2.mp4': 'unlinked vid 2',
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

		function getDirAndFile(file){
			var fileArray = file.split('/')
			var fileName = fileArray.pop();
			return [fileArray.join('/'), fileName]
		}

		//mocking the fs renaming 
		sandbox.stub(fs, 'rename').callsFake(function(oldFile, newFile, callback){
			var oldInfo = getDirAndFile(oldFile)
			var newInfo = getDirAndFile(newFile)
			mockFileSystemData[newInfo[0]][newInfo[1]] = mockFileSystemData[oldInfo[0]][oldInfo[1]]
			delete mockFileSystemData[oldInfo[0]][oldInfo[1]]
			mockFs(mockFileSystemData)
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

	it('should link unlinked video to episode', function() {
		var unlinkedVideoName = Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]
		var params = {unlinked_video: unlinkedVideoName.split('.')[0], episode_id: mockEpisodeData[2].episode_id}
		var origFileContent = mockFileSystemData[UNLINKED_FOLDER][Object.keys(mockFileSystemData[UNLINKED_FOLDER])[0]]
		action.get_linkVideoToEpisode(params, function(result){
			action._getAllUnlinkedVideos(fakeBaton,(linked_videos) => {
				expect(linked_videos[unlinkedVideoName]).to.equal(null);
			})
			expect(result.episode_id_linked).to.equal(params.episode_id);
			expect(mockFileSystemData[LINKED_FOLDER][params.episode_id+'.mp4']).to.equal(origFileContent)
		})
	})
})