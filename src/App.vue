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

<script setup lang="ts">
import Toolbar from '/@/components/Toolbar/Toolbar.vue'
import Editor from '/@/components/Editor/Editor.vue'
import Greet from '/@/components/Greet/Greet.vue'
import Changelog from '/@/components/Windows/Changelog/Changelog.vue'
import CreateProject from '/@/components/Windows/CreateProject/CreateProject.vue'
import Settings from './components/Windows/Settings/Settings.vue'
</script>

<style scoped></style>
