<template>
	<div class="rounded-lg bg elevation-4">
		<slot />
	</div>
</template>

<script>
export default {
	name: 'BridgeSheet',
}
</script>

<style scoped>
.bg {
	background: var(--v-expandedSidebar-base);
}
</style>
