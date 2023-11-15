<template>
	<main class="w-screen h-screen bg-background">
		<Toolbar />
		<Greet />
		<Changelog />
	</main>
</template>

<script setup lang="ts">
import Toolbar from '/@/components/Toolbar/Toolbar.vue'
import Greet from '/@/components/Greet/Greet.vue'
import Changelog from '/@/components/Windows/Changelog/Changelog.vue'
</script>

<style scoped></style>
