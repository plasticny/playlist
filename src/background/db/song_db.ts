import { sqlite } from '../sqlite'

export class SongDB {
  public async get_song_by_id (id : number) : Promise<Song | undefined> {
    const res = await sqlite.all<Song>(`
      select * from Song where id = ?;
    `, [id])
    return res.length > 0 ? res[0] : undefined
  }

  public get_songs_by_playlist_id (playlist_id : number) {
    return sqlite.all<Song>(`
      select *
      from Song
      where playlist_id = ?
      order by latest_play asc;
    `, [playlist_id])
  }

  public add_song (title : string, thumbnail_url : string, url : string, playlist_id : number) {
    return sqlite.run(`
      insert into Song (title, thumbnail_url, url, latest_play, playlist_id)
      values (?, ?, ?, 0, ?)
    `, [title, thumbnail_url, url, playlist_id])
  }

  public delete_song (id : number) {
    return sqlite.run(`
      delete from Song where id = ?;
    `, [id])
  }

  public update_latest_play (id : number, latest_play : number) {
    return sqlite.run(`
      update Song set latest_play = ? where id = ?;
    `, [latest_play, id])
  }
}
export const song_db = new SongDB()
