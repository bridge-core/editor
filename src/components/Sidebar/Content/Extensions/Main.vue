<template>
    <div>
        <div class="container">
            <PluginIntro style="margin-bottom: 8px;" />
            <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" />
        </div>
    </div>
</template>

<script>
import PluginIntro from './PluginIntro'
import PluginCard from './PluginCard'

export default {
    name: 'Extensions',
    components: {
        PluginIntro,
        PluginCard
    },
    data() {
        return {
		// Temporary plugins for testing
            plugins: [
                {
                    name: 'SpecialPlugin',
                    description: 'Gives you superpowers!',
                    id: 'plugin1',
                    version: '1.0.0',
                    author: 'Joelant05',
                    active: true
                },
                {
                    name: 'TestPlugin',
                    description: 'Just a test.',
                    id: 'plugin2',
                    version: '1.0.0',
                    author: 'Joelant05',
                    active: true,
                    link: 'https://wiki.bedrock.dev/'
                }
            ]
        }
    }
}
</script>

<style scoped>
div.container {
    padding: 4px;
    overflow-y: auto;
}
</style>