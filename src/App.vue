<template>
	<main class="w-screen h-screen bg-background">
		<Toolbar />
		<Greet />
		<Changelog />
		<CreateProject />
	</main>
</template>

<script setup lang="ts">
import Toolbar from '/@/components/Toolbar/Toolbar.vue'
import Greet from '/@/components/Greet/Greet.vue'
import Changelog from '/@/components/Windows/Changelog/Changelog.vue'
import CreateProject from '/@/components/Windows/CreateProject/CreateProject.vue'
</script>

<style scoped></style>
