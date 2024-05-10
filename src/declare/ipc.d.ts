// return type with terminate / unterminate
// only used in this file
type ret<termin, untermin = void> = { termin : termin, untermin : untermin }

declare type IpcChannels = keyof Ipc
declare type TIpcParam<channel extends IpcChannels> = Parameters<Ipc[channel]>
declare type TIpcRet<channel extends IpcChannels> = ReturnType<Ipc[channel]>['termin']
declare type TIpcUnTermRet<channel extends IpcChannels> = ReturnType<Ipc[channel]>['untermin']

// data type return from main to render
declare type TIpcMainRet<channel extends IpcChannels> = {
  id: number,
  data: TIpcRet<channel> | TIpcUnTermRet<channel>,
  terminate: boolean
}

// ipc session in main
declare interface IpcMainSession<channel extends IpcChannels> {
  reply: (data : TIpcRet<channel>) => void
  send: (data : TIpcUnTermRet<channel>) => void
}
declare type IpcMainSessionPick<channel extends IpcChannels> = Pick<IpcMainSession<channel>, 'send'>

// ipc handler in main
declare type TIpcHandler<channel extends IpcChannels> = (...params : Parameters<Ipc[channel]>) => Promise<TIpcRet<channel>>
declare type TIpcHandlerWithSession<channel extends IpcChannels> = (
  session : IpcMainSessionPick<channel>, ...params : Parameters<TIpcHandler<channel>>
) => ReturnType<TIpcHandler<channel>>

/* Edit this */
declare type Ipc = {
  /* song */
  download : (id : number) => ret<string | undefined>,
  get_next_song : (playlist_id : number) => ret<Song>,
  update_latest_play: (id : number, latest_play : number) => ret<void>,
  get_song_list : (playlist_id : number) => ret<Song[]>,

  /* playlist */
  get_all_playlist : () => ret<Playlist[]>,
  save_playlist : (url : string) => ret<boolean, { playlist_info : PlaylistInfo, loaded : number }>,
  reload_playlist : (playlist_id : number) => ret<boolean, { playlist_info : PlaylistInfo, loaded : number }>,
  stop_load_playlist : () => ret<void>
}
/* Edit this */
