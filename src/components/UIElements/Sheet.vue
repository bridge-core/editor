<template>
	<div class="rounded-lg" :class="{ 'bg-dark': dark, bg: !dark }">
		<slot />
	</div>
</template>

<script>
export default {
	name: 'BridgeSheet',
	props: {
		dark: Boolean,
	},
}
</script>

<style scoped>
.bg {
	background: var(--v-expandedSidebar-base);
}
.bg-dark {
	background: var(--v-background-base);
}
</style>
