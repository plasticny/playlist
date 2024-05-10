/*
  provide service for components to communicate with each other
*/
import mitt from 'mitt'
import { Ref, ref } from 'vue'

/* event bus */
export enum EventBusType {
  updata_song_list = 'updata_song_list',
  play_song = 'play_song'
}

const event_bus = mitt()
export function event_bus_on (event: EventBusType, handler: () => void) {
  event_bus.on(event, handler)
}
export function event_bus_emit (event: EventBusType) {
  event_bus.emit(event)
}

/* song and playlist */
export const cur_song : Ref<Song | undefined> = ref(undefined)
export const cur_playlist : Ref<Playlist | undefined> = ref(undefined)
