<script setup lang="ts">
import { setup, setupBeforeComponents } from '@/App'

import Toolbar from '@/components/Toolbar/Toolbar.vue'
import Greet from '@/components/Greet/Greet.vue'
import Editor from '@/components/Editor/Editor.vue'
import Windows from '@/components/Windows/Windows.vue'

import { onMounted } from 'vue'

setupBeforeComponents()

onMounted(() => {
	setup()
})
</script>

<template>
	<main class="w-screen h-screen bg-background">
		<Toolbar />
		<Editor />
		<Greet />
		<Windows />
	</main>
</template>
