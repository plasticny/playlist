<template>
  <div id="add_playlist_dg_comp">
    <BaseDialog ref="dialog" >
      <div>Please enter the url of the playlist:</div>
      <form method="dialog">
        <div>
          <input type="text" v-model="url">
        </div>
        <div>
          <button class="submit" @click="api.add_clicked">
            Add
          </button>
          <button class="cancel">
            Cancel
          </button>
        </div>
      </form>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
import { getCurrentInstance, Ref, ref } from 'vue'

const instance : VueRefs<{
  dialog: InstanceType<typeof BaseDialog>
}> = getCurrentInstance()! as any

const url : Ref<string> = ref('')

const emit = defineEmits<{
  (evt: 'add', url: string): void
}>()

class ComponetApi {
  public add_clicked () {
    const url_value = url.value
    url.value = ''
    emit('add', url_value)
  }
}
const api = new ComponetApi()

defineExpose({
  open: () => { instance.refs.dialog.open() },
  close: () => { instance.refs.dialog.close() }
})
</script>
