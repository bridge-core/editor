<template>
  <BaseWindow
      windowTitle="windows.changelogWindow.title"
      :isVisible="isVisible"
      :hasMaximizeButton="false"
      :isFullscreen="false"
      :width="600"
      :height="600"
      @closeWindow="onClose"
  >
    <template #default>
      <h1>{{ $data.version }}</h1>
      <v-divider class="mt-4 mb-4" />
      <div v-html="$data.changelog"></div>
    </template>
  </BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow'

export default {
  name: 'ChangelogComponent',
  components: {
    BaseWindow,
  },
  props: ['currentWindow'],
  data() {
    return this.currentWindow
  },
  methods: {
    onClose() {
      this.currentWindow.close()
    },
  },
}
</script>

<style scoped>

</style>