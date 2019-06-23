
from moviepy.editor import *
from os import path
import sys, getopt


def getArgs(argv):
	file = None
	compilation = None
	start_time = None
	end_time = None
	
	try:
		opts, args = getopt.getopt(argv,"f:c:s:d:")
	except getopt.GetoptError:
		print 'initial error '
		print 'test.py -f <file> -c <compilation> -s <start_time> -e <end_time>'
		sys.exit(2)
	for opt, arg in opts:
		if opt in ("-f"):
			print 'file ' + arg
			file = arg
		elif opt in ("-c"):
			compilation = arg
		elif opt in ("-s"):
			start_time = int(arg)
		else:
			duration = int(arg)
	return file, compilation, start_time, duration

if __name__ == "__main__":

	file, compilation, start_time, duration = getArgs(sys.argv[1:])
	# Load myHolidays.mp4 and select the subclip 00:00:50 - 00:00:60
	clip_input = VideoFileClip(file).subclip(start_time,start_time + duration)

	if path.exists(compilation) : 
		clip_comp = VideoFileClip(compilation)
		video = concatenate_videoclips([clip_comp,clip_input])
	else:
		video = CompositeVideoClip([clip_input])

	# Write the result to a file (many options available !)
	video.write_videofile('compilation_testing.mp4', temp_audiofile="temp-audio.m4a", remove_temp=True, codec="libx264", audio_codec="aac")
	if path.exists(compilation):
		os.remove(compilation)
	os.rename('compilation_testing.mp4', compilation)