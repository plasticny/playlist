import { sqlite } from '../sqlite'

export class PlaylistDB {
  public get_all_playlist () {
    return sqlite.all<Playlist>(`
      select * from Playlist;
    `)
  }

  public async add_playlist (title : string, url : string) : Promise<number> {
    await sqlite.run(`
      insert into Playlist (title, url) values (?, ?);
    `, [title, url])

    const ids = await sqlite.all<{ id: number }>(`
      select max(id) as id from Playlist;
    `)
    return ids[0].id
  }

  public async get_playlist_by_id (id : number) : Promise<Playlist> {
    return (await sqlite.all<Playlist>(`
      select * from Playlist where id = ?;
    `, [id]))[0]
  }

  public update_playlist_title (id : number, title : string) {
    return sqlite.run(`
      update Playlist set title = ? where id = ?;
    `, [title, id])
  }

  public clear_playlist (id : number) {
    return sqlite.run(`
      delete from Song where playlistId = ?;
    `, [id])
  }
}
export const playlist_db = new PlaylistDB()
