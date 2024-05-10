import { playlist_db } from '../db/playlist_db'
import { song_db } from '../db/song_db'
import { loader as song_ls_loader } from './song_list_loader'
import { run_python } from '../python_helper'

async function __get_songlist_update (old_ls : Playlist, new_ls : PlaylistInfo) : Promise<[Array<string>, Array<number>]> {
  const song_ls : Array<Song> = await song_db.get_songs_by_playlist_id(old_ls.id)

  const new_url_set = new Set(new_ls.urls)

  const removed_song_ids : Array<number> = []
  for (const { id, url } of song_ls) {
    if (!new_url_set.has(url)) {
      removed_song_ids.push(id)
    } else {
      new_url_set.delete(url)
    }
  }

  const added_urls = Array.from(new_url_set)

  return [added_urls, removed_song_ids]
}

export class PlaylistService {
  public async save_playlist (session : IpcMainSessionPick<'save_playlist'>, url : string): Promise<boolean> {
    const playlist_info = await run_python('get_playlist', url)

    await song_ls_loader.load(
      playlist_info.urls,
      (song_info, loaded) => {
        session.send({ playlist_info, loaded })
      }
    )
    if (song_ls_loader.is_termianted()) {
      return false
    }

    const playlist_id = await playlist_db.add_playlist(playlist_info.title, url)
    for (const song of song_ls_loader.song_ls) {
      await song_db.add_song(song.title, song.thumbnail_url, song.url, playlist_id)
    }
    return true
  }

  public async reload_playlist (session : IpcMainSessionPick<'reload_playlist'>, playlist_id : number): Promise<boolean> {
    const playlist : Playlist = await playlist_db.get_playlist_by_id(playlist_id)
    const updated_playlist_info : PlaylistInfo = await run_python('get_playlist', playlist.url)

    const [added_urls, removed_song_ids] = await __get_songlist_update(playlist, updated_playlist_info)

    await song_ls_loader.load(
      added_urls,
      (song_info, loaded) => {
        session.send({ playlist_info: updated_playlist_info, loaded })
      }
    )
    if (song_ls_loader.is_termianted()) {
      return false
    }

    // update playlist
    await playlist_db.update_playlist_title(playlist_id, updated_playlist_info.title)
    for (const song of song_ls_loader.song_ls) {
      await song_db.add_song(song.title, song.thumbnail_url, song.url, playlist_id)
    }
    for (const id of removed_song_ids) {
      await song_db.delete_song(id)
    }
    return true
  }

  public stop_song_list_loader () : Promise<void> {
    song_ls_loader.stop()
    return Promise.resolve()
  }

  public async get_all_playlist () : Promise<Array<Playlist>> {
    return playlist_db.get_all_playlist()
  }
}
export const playlist_service = new PlaylistService()
