declare interface Song {
  id: number
  title: string
  thumbnail_url: string
  url: string
  latest_play: number
  playlist_id: number
}

declare interface Playlist {
  id : number
  title : string
  url : string
}

// playlist info loaded from python
declare type PlaylistInfo = {
  title: string
  urls: Array<string>
}

// song info loaded from python
declare type SongInfo = {
  url: string
  title: string
  thumbnail_url: string
}

declare interface VueRefs<refs_el> {
  refs: refs_el
}
