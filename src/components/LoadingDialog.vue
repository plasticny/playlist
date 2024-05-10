<template>
  <div id="loading_dg_comp">
    <BaseDialog ref="dialog">
      <span>
        Loading <b>{{ title }}</b> ...&nbsp;
        <span v-show="to_load_cnt !== undefined">
          {{ loaded_cnt }} / {{ to_load_cnt }}
        </span>
      </span>
      <div>
        <button class="cancel" @click="emit('stop')">
          Cancel
        </button>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
import { getCurrentInstance, ref, Ref } from 'vue'

const title = ref('')
const to_load_cnt : Ref<number | undefined> = ref(undefined)
const loaded_cnt = ref(0)

const emit = defineEmits<{
  (evt: 'stop'): void
}>()

const instance : VueRefs<{
  dialog: InstanceType<typeof BaseDialog>
}> = getCurrentInstance()! as any

class ComponetApi {
  public reset () {
    title.value = ''
    to_load_cnt.value = undefined
    loaded_cnt.value = 0
  }

  public set_title (val : string) {
    title.value = val
  }

  public set_to_load_cnt (val : number) {
    to_load_cnt.value = val
  }

  public add_loaded_cnt () {
    loaded_cnt.value++
  }
}
const api = new ComponetApi()

defineExpose({
  open: () => { instance.refs.dialog.open() },
  close: () => { instance.refs.dialog.close() },
  reset: api.reset,
  set_title: api.set_title,
  set_to_load_cnt: api.set_to_load_cnt,
  add_loaded_cnt: api.add_loaded_cnt
})
</script>
