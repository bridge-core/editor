<template>
    <div>
        <div class="container">
            <PluginIntro style="margin-bottom: 8px;" />
        </div>
    </div>
</template>

<script>
import PluginIntro from './PluginIntro'

export default {
    name: 'Extensions',
    components: {
        PluginIntro
    }
}
</script>

<style scoped>
div.container {
    padding: 4px;
    overflow-y: auto;
}
</style>