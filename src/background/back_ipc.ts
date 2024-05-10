/*
  Register ipcMain handler
*/
import { ipcMain } from 'electron'
import { song_service } from './song/song'
import { playlist_service } from './playlist/playlist'

interface RegHandler<channel extends IpcChannels> {
  session : false,
  handler : TIpcHandler<channel>
}
interface RegHandlerWithSession<channel extends IpcChannels> {
  session : true,
  handler : TIpcHandlerWithSession<channel>
}

function __create_session<channel extends IpcChannels> (
  evt : Electron.IpcMainEvent, ch : channel, id : number
) : Readonly<IpcMainSession<channel>> {
  const session : IpcMainSession<channel> = {
    reply: (data) => {
      const ret : TIpcMainRet<channel> = { id, data, terminate: true }
      evt.reply(ch, ret)
    },
    send: (data) => {
      const ret : TIpcMainRet<channel> = { id, data, terminate: false }
      evt.reply(ch, ret)
    }
  }
  return session
}

function __handler_wrapper<channel extends IpcChannels> (
  ch : channel, handler : TIpcHandlerWithSession<channel>
) {
  // args : [...params, id]
  ipcMain.on(ch, async (evt, ...args) => {
    const id = args.pop() as number
    const params : Parameters<Ipc[channel]> = args as any
    const session = __create_session(evt, ch, id)
    const data = await handler(session, ...params)
    session.reply(data)
  })
}

function __reg_handler<channel extends IpcChannels> (
  ch : channel, handler : TIpcHandler<channel>
) {
  __handler_wrapper(ch, (_, ...params) => {
    return handler(...params)
  })
}

function _reg_handler_w_session<channel extends IpcChannels> (
  ch : channel, handler : TIpcHandlerWithSession<channel>
) {
  __handler_wrapper(ch, (session : IpcMainSessionPick<channel>, ...params) => {
    return handler(session, ...params)
  })
}

export function register () {
  for (const [ch, { session, handler }] of Object.entries(register_map)) {
    if (session) {
      _reg_handler_w_session(ch as IpcChannels, handler as TIpcHandlerWithSession<IpcChannels>)
    } else {
      __reg_handler(ch as IpcChannels, handler as TIpcHandler<IpcChannels>)
    }
  }
}

/* Edit this */
const register_map : {
  [channel in IpcChannels] : RegHandler<channel> | RegHandlerWithSession<channel>
} = {
  // song
  download: { session: false, handler: song_service.download },
  get_next_song: { session: false, handler: song_service.get_next_song },
  update_latest_play: { session: false, handler: song_service.update_lastest_play },
  get_song_list: { session: false, handler: song_service.get_song_list },

  // playlist
  get_all_playlist: { session: false, handler: playlist_service.get_all_playlist },
  save_playlist: { session: true, handler: playlist_service.save_playlist },
  reload_playlist: { session: true, handler: playlist_service.reload_playlist },
  stop_load_playlist: { session: false, handler: playlist_service.stop_song_list_loader }
}
/* Edit this */
