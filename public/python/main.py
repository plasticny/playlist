from sys import stdout, argv
from json import dumps as jsonDumps
from YtFetcher import getYtPlaylist, getYtSongInfo
from Downloader import download
from collections.abc import Callable

METHODS : dict[str, Callable[[str], any]] = {
  # [YtFetcher]
  # get all url of videos in a yt playlist, return json
  'get_playlist': getYtPlaylist,
  # get the info required for stored a yt song in db, return json
  'get_song_info': getYtSongInfo,
  
  # [Downloader]
  'download': download
}

if __name__ == '__main__':
  stdout.reconfigure(encoding="utf-8")
  if not(len(argv) < 2):
    methodName = argv[1]
    params = argv[2:]
    
    if methodName in METHODS:
      result = METHODS[methodName](*params)
      json = jsonDumps(result, ensure_ascii=False)
      print(json)
