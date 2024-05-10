declare global {
  interface Window {
    ipc: {
      send: (channel: string, ...args: any[]) => void
      on: (channel: string, listener: (...args: any[]) => void) => void
    }
  }
}

function handle_recevie (ret : TIpcMainRet<IpcChannels>) {
  console.log('receive', ret)

  if (!main_ipc_listener.check_handler(ret.id)) {
    throw new Error(`handler not found ${ret.id}`)
  }

  if (ret.terminate) {
    main_ipc_listener.get_ret_handler(ret.id)!(ret.data as TIpcRet<IpcChannels>)
    main_ipc_listener.delete_handler(ret.id)
  } else {
    main_ipc_listener.get_unterm_ret_handler(ret.id)!(ret.data as TIpcUnTermRet<IpcChannels>)
  }
}

class MainIpcListener {
  protected __listening_channels = new Set<IpcChannels>()
  protected __ret_handler_map = new Map<number, (data : TIpcRet<IpcChannels>) => void>()
  protected __unterm_ret_handler_map = new Map<number, (data : TIpcUnTermRet<IpcChannels>) => void>()

  public get_ret_handler (id : number) {
    return this.__ret_handler_map.get(id)
  }

  public get_unterm_ret_handler (id : number) {
    return this.__unterm_ret_handler_map.get(id)
  }

  public check_handler (id : number) : boolean {
    return this.__ret_handler_map.has(id)
  }

  public delete_handler (id : number) : void {
    this.__ret_handler_map.delete(id)
    this.__unterm_ret_handler_map.delete(id)
  }

  public on_ret<channel extends IpcChannels> (caller : IpcCaller<channel>) : Promise<TIpcRet<channel>> {
    this._listen_channel(caller.ch)
    return new Promise(resolve => {
      this.__ret_handler_map.set(caller.id, resolve)
    })
  }

  public on_unterm_ret<channel extends IpcChannels> (caller : IpcCaller<channel>, handler : (data : TIpcUnTermRet<channel>) => void) {
    this.__unterm_ret_handler_map.set(caller.id, handler)
  }

  protected _listen_channel (ch : IpcChannels) {
    if (!this.__listening_channels.has(ch)) {
      window.ipc.on(ch, handle_recevie)
      this.__listening_channels.add(ch)
    }
  }
}
const main_ipc_listener = new MainIpcListener()
const used_id_set = new Set<number>()

export class IpcCaller<channel extends IpcChannels> {
  protected _ch : channel
  protected _id : number

  // if _unterminate_handler is undefined, that means the ipc will not return any unterminate data
  constructor (
    ch : channel,
    _unterminate_handler? : TIpcUnTermRet<channel> extends void ? undefined : (data : TIpcUnTermRet<channel>) => void
  ) {
    this._ch = ch

    this._id = Date.now()
    while (used_id_set.has(this._id)) {
      this._id++
    }
    used_id_set.add(this._id)

    if (_unterminate_handler !== undefined) {
      main_ipc_listener.on_unterm_ret<channel>(this, _unterminate_handler)
    }
  }

  public get ch () {
    return this._ch
  }

  public get id () {
    return this._id
  }

  public call (...params : TIpcParam<channel>) : Promise<TIpcRet<channel>> {
    console.log('send', { id: this._id, ch: this._ch, params })
    window.ipc.send(this._ch, ...params, this._id)
    return main_ipc_listener.on_ret<channel>(this)
  }
}
