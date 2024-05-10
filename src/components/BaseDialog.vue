<template>
  <dialog ref="dialog">
    <slot></slot>
  </dialog>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance : VueRefs<{
  dialog: HTMLDialogElement
}> = getCurrentInstance()! as any

class ComponetApi {
  public open () {
    if (instance.refs.dialog.showModal !== undefined) {
      instance.refs.dialog.showModal()
    } else {
      instance.refs.dialog.open = true
    }
  }

  public close () {
    if (instance.refs.dialog.close !== undefined) {
      instance.refs.dialog.close()
    } else {
      instance.refs.dialog.open = false
    }
  }
}
const api = new ComponetApi()

defineExpose({
  open: api.open,
  close: api.close
})
</script>

<style>
dialog {
  border: 1px solid #0000008f;
  border-radius: 5px;
  padding: 10px;
}
</style>
