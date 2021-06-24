<template>
	<div class="pa-1 rounded-lg bg">
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
