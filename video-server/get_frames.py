from moviepy.editor import *
from os import path
import sys, getopt

def getArgs(argv):
	
	# file start_time duration totalLength
	return argv[1], int(argv[2]), int(argv[3]), argv[4]

def printAndFlush(data):

	print(data)
	sys.stdout.flush()

file, start_time, duration, totalLength= getArgs(sys.argv)
if totalLength:
	clip = VideoFileClip(file)
	printAndFlush(sum(1 for x in clip.iter_frames()))
else:
	clip = VideoFileClip(file).subclip(start_time,start_time + duration)
	printAndFlush(sum(1 for x in clip.iter_frames()))