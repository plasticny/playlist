<template>
  <div id="playlist">
    <!-- index -->
    <div id="playlistIndex">
      <button id="btnAdd" @click="instance.refs.add_playlist_dg.open()">
        Add
      </button>
      <div>
        <button v-for="list in playlist_ls" :key="list.id"
          @click="api.select_playlist(list)">
          {{ list.title }}
        </button>
      </div>
    </div>

    <!-- display playlist -->
    <div id="playlistDisplay" :class="{'empty' : song_list.length==0}">
      <!-- when no playlist is selected -->
      <span v-show="cur_playlist === undefined">
        Please select a playlist
      </span>

      <!-- when a playlist is selected -->
      <div v-show="cur_playlist !== undefined">
        <div id="playlistInfo">
          <span id="playlistTitle">{{ cur_playlist ? cur_playlist.title : '' }}</span>
          <button @click="api.reload_playlist">
            reload
          </button>
        </div>
        <button v-for="song of song_list" :key="song.id" class="song"
          @click="api.select_song(song)">
          {{ song.title }}
        </button>
      </div>
    </div>

    <!-- popup dialogs -->
    <AddPlaylistDialog
      ref="add_playlist_dg"
      @add="api.add_playlist"
    />
    <LoadingDialog
      ref="loading_dg"
      @stop="api.on_loading_dg_stop_clicked"
    />
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, Ref, ref } from 'vue'

import LoadingDialog from './LoadingDialog.vue'
import AddPlaylistDialog from './AddPlaylistDialog.vue'

import { IpcCaller } from '@/service/front_ipc'
import {
  event_bus_emit, event_bus_on, EventBusType,
  cur_playlist, cur_song
} from '@/service/comm_service'

// === variables === //
const instance : {
  refs: {
    loading_dg: InstanceType<typeof LoadingDialog>
    add_playlist_dg: InstanceType<typeof AddPlaylistDialog>
  }
} = getCurrentInstance()! as any

const playlist_ls : Ref<Array<Playlist>> = ref([])
const song_list : Ref<Array<Song>> = ref([])

// === methods === //
class ComponetApi {
  public async get_playlist_index () {
    playlist_ls.value = await new IpcCaller('get_all_playlist').call()
  }

  public async update_song_list () {
    if (cur_playlist.value === undefined || cur_playlist.value.id === undefined) {
      return
    }
    song_list.value = await new IpcCaller('get_song_list').call(cur_playlist.value.id)
  }

  public async select_playlist (playlist : Playlist) {
    cur_playlist.value = playlist
    await this.update_song_list()
  }

  public select_song (song: Song) {
    cur_song.value = song
    event_bus_emit(EventBusType.play_song)
  }

  public async add_playlist (url: string) {
    instance.refs.add_playlist_dg.close()

    const saved = await new IpcCaller('save_playlist', api.on_loading_process).call(url)
    if (saved === true) {
      await api.get_playlist_index()
    }

    instance.refs.loading_dg.close()
  }

  public async reload_playlist () {
    if (cur_playlist.value === undefined || cur_playlist.value.id === undefined) {
      return
    }

    const reloaded = await new IpcCaller('reload_playlist', api.on_loading_process).call(cur_playlist.value.id)
    if (reloaded === true) {
      this.get_playlist_index()
      await this.update_song_list()
    }

    instance.refs.loading_dg.close()
  }

  public open_loading_dg (title: string, to_load_cnt: number) {
    instance.refs.loading_dg.reset()
    instance.refs.loading_dg.set_title(title)
    instance.refs.loading_dg.set_to_load_cnt(to_load_cnt)
    instance.refs.loading_dg.open()
  }

  public on_loading_process ({ playlist_info, loaded } : { playlist_info: PlaylistInfo, loaded: number}) {
    if (loaded === 0) {
      api.open_loading_dg(playlist_info.title, playlist_info.urls.length)
    } else {
      instance.refs.loading_dg.add_loaded_cnt()
    }
  }

  public on_loading_dg_stop_clicked () {
    new IpcCaller('stop_load_playlist').call()
    instance.refs.loading_dg.close()
  }
}
const api = new ComponetApi()

onMounted(() => {
  api.get_playlist_index()
})

event_bus_on(EventBusType.updata_song_list, api.update_song_list)
</script>

<style lang="scss">
#playlist {
  display: flex;
}

#playlist {
  #btnAdd {
    width: 100%;
    margin-bottom: 15px;
  }
  #playlistIndex {
    min-width: 100px;
    background-color: #15151A;
    padding: 10px 5px;

    button:not(#btnAdd) {
      margin-bottom: 5px;
      width: 100%;
    }
  }
}

#playlist {
  #playlistDisplay {
    overflow-y: auto;
    width: 100%;
    padding: 15px;
    color: white;
    background-color: #292933;

    &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #playlistInfo {
      margin-bottom: 15px;
      #playlistTitle {
        margin-right: 10px;
        font-size: 30px;
      }
    }

    .song {
      display: block;
      margin-bottom: 8px;
      width: 100%;
      text-align: left;
    }
  }
}
</style>
