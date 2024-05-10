<template>
  <div class="home">
    <PlayList />
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import PlayList from '@/components/PlayList.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
</script>

<style lang="scss">
.home {
  height: 100%;
  display: flex;
  flex-direction: column;

  #playlist {
    height: calc(100% - 85px);
  }
  #musicPlayer {
    height: 85px;
  }
}
</style>
