import { run_python } from '../python_helper'

interface SongListLoader {
  // 0: idle, 1: loading, 2: loaded, 3: terminated
  status : 0 | 1 | 2 | 3,
  song_ls : Array<SongInfo>,
  load : (...params : Parameters<typeof _load>) => ReturnType<typeof _load>,
  stop : (...params : Parameters<typeof _stop>) => ReturnType<typeof _stop>,
  is_termianted : (...params : Parameters<typeof _is_termianted>) => ReturnType<typeof _is_termianted>,
}

async function _load (
  url_ls : Array<string>,
  on_process? : (song_info : SongInfo | undefined, loaded : number) => void
) : Promise<void> {
  if (loader.status === 1) {
    throw new Error('SongListLoader is already loading a playlist.')
  }

  // callback for start loading
  if (on_process !== undefined) {
    on_process(undefined, 0)
  }

  loader.status = 1
  loader.song_ls = []
  for (const url of url_ls) {
    if(loader.is_termianted()) {
      return
    }
    const song_info = await run_python('get_song_info', url)
    console.log(song_info)

    loader.song_ls.push(song_info)

    // callback for loaded a song
    if (on_process !== undefined) {
      on_process(song_info, loader.song_ls.length)
    }
  }
  loader.status = 2
}

function _stop () : void {
  loader.status = 3
}

function _is_termianted () : boolean {
  return loader.status === 3
}

export const loader : SongListLoader = {
  status: 0,
  song_ls: [],
  load: _load,
  stop: _stop,
  is_termianted: _is_termianted
}
