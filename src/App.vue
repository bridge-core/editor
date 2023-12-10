<script setup lang="ts">
import Toolbar from '@/components/Toolbar/Toolbar.vue'
import Greet from '@/components/Greet/Greet.vue'
import Editor from './components/Editor/Editor.vue'
import Changelog from '@/components/Windows/Changelog/Changelog.vue'
import CreateProject from '@/components/Windows/CreateProject/CreateProject.vue'
import Settings from '@/components/Windows/Settings/Settings.vue'
import Confirm from '@/components/Windows/Confirm/Confirm.vue'

import { onMounted } from 'vue'
import { setup } from '@/App'

onMounted(() => {
	setup()
})
</script>

<template>
	<main class="w-screen h-screen bg-background">
		<Toolbar />
		<Editor />
		<Greet />
		<Changelog />
		<CreateProject />
		<Settings />
		<Confirm />
	</main>
</template>
