var Queue = require('bull');

var REDIS_URL = 'redis://rediscloud:GCcIhH8zfBMj8qbEWC9On672D0ehStpI@redis-13782.c8.us-east-1-4.ec2.cloud.redislabs.com:13782'

var REDIS_CRED = {
	host: 'redis-13782.c8.us-east-1-4.ec2.cloud.redislabs.com',
	port: 13782,
	password: 'GCcIhH8zfBMj8qbEWC9On672D0ehStpI',
	database: '0'
}

var videoQueue = new Queue('video', REDIS_URL, {
	defaultJobOptions: {
		//removeOnComplete: true,
		attempts:2
	}
})

videoQueue.getActive().then(prevActiveJobs => {
	if(prevActiveJobs.length > 0){
		prevActiveJobs.forEach(job => {
			console.log(job.getState())
		})
	}
})


var i = 0
videoQueue.process('timestamp', function(job, done) {

	videoQueue.getFailedCount().then(failedCount => {
		if (failedCount == 0) {
			console.log('starting up the video queue b/c no failed jobs ')
			videoQueue.resume(true).then(() => {

				//call done when finished
				i += 1
								if (i > 4) {
					done('eroor ---');
					videoQueue.pause(true).then(_ => {
						console.log('stop')
						return;
					})
				} else {
					console.log('starting job ')
					setTimeout(() => {
						console.log('ended job ' + job.data.id)
						done()
					}, 10000)
				}
			})

		} else {
			console.log('there is a failed job; queue will not start')
		}
	})

});


module.exports = {
	REDIS_CRED: REDIS_CRED,
	REDIS_URL: REDIS_URL,
	add: function(obj) {
		videoQueue.add('timestamp', obj).then(_ => {
			console.log('job added ' + obj.id)
		})
	},
	status: function(res) {
		var data = {}
		videoQueue.getJobCounts().then(jobs => {
			res.json(jobs)

		})
	},
	clean: function(res) {
		videoQueue.clean(5000).then(_ => {
			res.json('cleaned queue')
		})
	}

}