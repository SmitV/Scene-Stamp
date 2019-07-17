import socket
import sys

import os
import paramiko

def printAndFlush(data):

	print(data)
	sys.stdout.flush()

remoteServer = "ec2-18-224-0-88.us-east-2.compute.amazonaws.com"

ssh = paramiko.SSHClient() 
ssh.load_host_keys(os.path.expanduser(os.path.join("~", ".ssh", "ubuntu")))
ssh.connect(remoteServer)
sftp = ssh.open_sftp()
sftp.put(localpath, remotepath)
sftp.close()
ssh.close()




printAndFlush(socket.gethostbyname(socket.gethostname()))