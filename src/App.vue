<script setup lang="ts">
import Toolbar from '@/components/Toolbar/Toolbar.vue'
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
	</main>
</template>
