import { song_db } from '../db/song_db';
import { file_helper } from '../file_helper';
import { run_python } from '../python_helper';

export class SongService {
  public async download (id : number) : Promise<string | undefined> {
    const song = await song_db.get_song_by_id(id)
    if (!song) {
      return undefined
    }

    const audio_path = `${__static}/audio`
    const python_path = `${__static}/python`

    file_helper.confirm_folder_exist(audio_path, true)
    file_helper.clear_folder(audio_path)

    let file_nm : string
    let file_path : string
    while (true) {
      const res = await run_python('download', song.url, audio_path, python_path)
      file_nm = res.file_nm
      file_path = `${audio_path}/${file_nm}.wav`
      if (await file_helper.check_file_exist(file_path)) {
        break
      }
    }
    return `audio/${file_nm}.wav`
  }

  public async get_next_song (playlist_id : number) : Promise<Song> {
    const song_ls = await song_db.get_songs_by_playlist_id(playlist_id)
    const idx = Math.floor(Math.random() * Math.min(song_ls.length, 5))
    return song_ls[idx]
  }

  public async update_lastest_play (id:number, latest_play:number) {
    await song_db.update_latest_play(id, latest_play)
  }

  public async get_song_list (playlist_id : number) : Promise<Song[]> {
    return song_db.get_songs_by_playlist_id(playlist_id)
  }
}
export const song_service = new SongService()
