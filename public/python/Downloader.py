from subprocess import call
from uuid import uuid4

def __runCommand (execCommand, paramCommands:list=[]):
  command = execCommand
  for param in paramCommands:
    command = f'{command} {param}'

  call(command, shell=True)
  
def download (url : str, ouputPath : str, pluginPath : str):  
  fileName = uuid4().__str__()
  filePath = f'{ouputPath}\\{fileName}.wav'
  __runCommand(
    execCommand=f'{pluginPath}\\yt-dlp.exe',
    paramCommands=[
      # quiet
      '-q',
      
      # ffmepg
      '--ffmpeg-location',
        f'{pluginPath}\\ffmpeg.exe',
      
      # format
      '-f 140',
      
      # audio
      '-x',
        '--audio-format wav',
      
      # output
      '-o',
        filePath,
      
      # url
      url
  ])
  return { "file_nm": fileName, "format": "wav" }