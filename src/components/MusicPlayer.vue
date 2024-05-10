<template>
  <div id="musicPlayer">

    <div id="progressContainer">
      <div id="progressBar" :style="{ width: progress + '%' }"></div>
    </div>

    <div id="contentOuter">
      <img id="thumbnail" ref="thumbnail"
        :class="{ 'hidden': cur_song === undefined }"
        :src="cur_song ? cur_song.thumbnail_url : ''"
      >
      <div id="contentInner">
        <div id="control">
          <font-awesome-icon icon="play" @click="api.toggle_play" v-show="!(player.playing)"/>
          <font-awesome-icon icon="pause" @click="api.toggle_play" v-show="player.playing"/>
          <font-awesome-icon icon="forward-step" @click="api.next_song"/>
          <input type="range" ref="volume_bar" id="ragVolume" min="0" max="1" step="0.01" value="1"
            @input="() => { player.set_volume(Number.parseFloat(instance.refs.volume_bar.value)) }">
        </div>
        <div id="title">
          {{ cur_song ? cur_song.title : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive, ref } from 'vue'

import {
  cur_song, cur_playlist,
  event_bus_emit, event_bus_on, EventBusType
} from '@/service/comm_service'
import { AudioContextPlayer } from '@/service/audio_context_player'
import { IpcCaller } from '@/service/front_ipc'

const instance: {
  refs: {
    volume_bar: HTMLInputElement
  }
} = getCurrentInstance()! as any

const player = reactive(new AudioContextPlayer())

const progress = ref(0)
const loading = ref(false)

class ComponetApi {
  public async play_song () {
    if (cur_song.value === undefined) {
      return
    }

    const song_id = cur_song.value.id

    player.stop()
    loading.value = true

    // download the song file
    const song_path : string | undefined = await new IpcCaller('download').call(song_id)
    if (song_path === undefined) {
      return
    }

    // update the latest play time
    new IpcCaller('update_latest_play').call(song_id, new Date().getTime())
      .then(() => {
        // call other components to update the song list
        event_bus_emit(EventBusType.updata_song_list)
      })

    // load the song file
    player.load(song_path)
      .then(() => {
        player.play()
        loading.value = false
      })
  }

  public async next_song () {
    if (cur_playlist.value === undefined) {
      return
    }
    player.stop()
    progress.value = 0
    cur_song.value = await new IpcCaller('get_next_song').call(cur_playlist.value.id)
    api.play_song()
  }

  public async toggle_play () {
    if (cur_playlist.value === undefined) {
      return
    }

    if (!player.do_buffer_loaded()) {
      api.next_song()
      return
    }

    if (player.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  public on_player_song_progress (current_time: number, duration?: number) {
    if (duration === undefined) {
      return
    }
    progress.value = Math.round((current_time / duration) * 100)
  }

  public on_player_song_end () {
    api.next_song()
  }
}
const api = new ComponetApi()

player.on_progress_handler = api.on_player_song_progress
player.on_ended_handler = api.on_player_song_end

event_bus_on(EventBusType.play_song, api.play_song)
</script>

<style lang="scss">
#musicPlayer {
  background-color: #15151A;
  color: whitesmoke;

  audio {
    display: none;
  }
}

#musicPlayer {
  #contentOuter {
    display: flex;
    padding: 10px 5px;
    align-items: center;

    #thumbnail {
      height: 60px;
      width: 60px;
      object-fit: cover;
      margin-left: 10px;

      &.hidden {
        opacity: 0;
      }
    }
    #contentInner {
      display: flex;
      align-items: center;
      flex-direction: column;
      width: calc(100% - 160px);

      #control {
        svg {
          margin-right: 10px;
          cursor: pointer;
        }
      }
    }
  }
}

#musicPlayer {
  #progressContainer {
    width: 100%;
    height: 3px;
    background-color: grey;
    overflow: hidden;

    #progressBar {
      height: 100%;
      background-color: whitesmoke;
      border-radius: 1px;
    }
  }
}
</style>
