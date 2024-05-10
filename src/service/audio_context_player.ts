export class AudioContextPlayer {
  public context : AudioContext = new AudioContext()

  public on_play_handler? : () => void
  public on_pause_handler? : () => void
  public on_progress_handler? : (current_time : number, duration? : number) => void
  public on_ended_handler? : () => void

  protected __gain_node : GainNode
  protected __source_node? : AudioBufferSourceNode
  protected __buffer? : AudioBuffer

  protected __playing = false
  protected __pausing = true
  protected __start_at? : number
  protected __pause_at = 0
  protected __progress_interval_id? : NodeJS.Timeout

  constructor () {
    this.__gain_node = this.context.createGain()
    this.__gain_node.gain.value = 0
    this.__gain_node.connect(this.context.destination)
  }

  get playing () {
    return this.__playing
  }

  get pausing () {
    return this.__pausing
  }

  public load (file_path: string) : Promise<void> {
    const xml = new XMLHttpRequest()
    xml.open('GET', file_path, true)
    xml.responseType = 'arraybuffer'

    return new Promise((resolve, reject) => {
      xml.onload = () => {
        this.context.decodeAudioData(
          xml.response,
          // on success
          (buffer) => {
            this.stop()
            this.__start_at = undefined
            this.__pause_at = 0
            this.__buffer = buffer
            resolve()
          },
          reject
        )
      }
      xml.send()
    })
  }

  public play () {
    if (this.__buffer === undefined) {
      throw new Error('Buffer is undefined')
    }

    this.__source_node = this.context.createBufferSource()
    this.__source_node.buffer = this.__buffer
    this.__source_node.connect(this.context.destination)
    this.__source_node.connect(this.__gain_node)
    this.__source_node.start(0, this.__pause_at)

    if (this.on_play_handler !== undefined) {
      this.on_play_handler()
    }

    if (this.__progress_interval_id !== undefined) {
      clearInterval(this.__progress_interval_id)
    }

    this.__progress_interval_id = setInterval(() => {
      const current_time = this.get_current_time()
      const duration = this.get_duration()

      if (this.on_progress_handler !== undefined) {
        this.on_progress_handler(current_time, duration)
      }

      if (duration !== undefined && current_time >= duration) {
        this.stop()
        this.__buffer = undefined

        if (this.on_ended_handler !== undefined) {
          this.on_ended_handler()
        }
      }
    }, 250)

    this.__start_at = this.context.currentTime - this.__pause_at
    this.__pause_at = 0
    this.__playing = true
    this.__pausing = false
  }

  public pause () {
    this.stop()

    if (this.on_pause_handler !== undefined) {
      this.on_pause_handler()
    }

    if (this.__start_at === undefined) {
      throw new Error('Start time is undefined')
    }
    this.__pause_at = this.context.currentTime - this.__start_at
  }

  public stop () {
    if (this.__source_node !== undefined) {
      this.__source_node.disconnect()
      this.__source_node.stop(0)
      this.__source_node = undefined
    }

    if (this.__progress_interval_id !== undefined) {
      clearInterval(this.__progress_interval_id)
    }

    this.__playing = false
  }

  public set_volume (volume : number) {
    if (volume < 0 || volume > 1) {
      console.error('Volume must be between 0 and 1')
      return
    }
    this.__gain_node.gain.value = volume - 1
  }

  public get_current_time () {
    if (this.__pause_at !== 0) {
      return this.__pause_at
    }
    if (this.__start_at !== undefined && this.__start_at !== 0) {
      return this.context.currentTime - this.__start_at
    }
    return 0
  }

  public get_duration () {
    if (this.__source_node === undefined || this.__source_node.buffer === undefined) {
      return undefined
    }
    return this.__source_node.buffer!.duration
  }

  public do_buffer_loaded () {
    return this.__buffer !== undefined
  }
}
