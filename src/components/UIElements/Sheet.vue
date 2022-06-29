<template>
	<div class="rounded-lg" :class="{ 'bg-dark': dark, bg: !dark }">
		<slot />
	</div>
</template>

<script>
export default {
	inheritAttrs: true,
	name: 'BridgeSheet',
	props: {
		dark: Boolean,
	},
}
</script>

<style scoped>
.bg {
	background: rgb(var(--v-theme-expandedSidebar));
}
.bg-dark {
	background: rgb(var(--v-theme-background));
}
</style>
