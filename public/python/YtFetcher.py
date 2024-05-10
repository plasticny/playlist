from pytube import Playlist, YouTube
from html.parser import HTMLParser
from requests import get

# get the info (title, thumbnail url, url) of a yt song
def getYtSongInfo (url : str):
  return {
    "title": getYtSongTitle(url)["title"], 
    "thumbnail_url": getYtSongThumbnailUrl(url)["thumbnail_url"], 
    "url": url
  }
  
# get all urls of video in a yt playlist
def getYtPlaylist (url : str):
  playlist = Playlist(url)
  return {
    "title": playlist.title,
    "urls": list(playlist.video_urls)
  }

# get the title of a youtube song
def getYtSongTitle (url : str):
  res = get(url)

  class TitleParser(HTMLParser):
    def __init__(self, *, convert_charrefs: bool = True) -> None:
      super().__init__(convert_charrefs=convert_charrefs)
      self.isTitle = False
      self.title = ""
    def handle_starttag(self, tag, attrs):
      if tag == "title":
        self.isTitle = True
    def handle_endtag(self, tag):
      if tag == "title":
        self.isTitle = False
    def handle_data(self, data):
      if self.isTitle:
        self.title = data

  parser = TitleParser()
  parser.feed(res.text)
  return {
    "title": parser.title[:-10]
  }

# get the thumbnail url of a youtube song
def getYtSongThumbnailUrl (url : str):
  return {
    "thumbnail_url": YouTube(url).thumbnail_url
  }
