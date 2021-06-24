<template>
	<div
		v-ripple
		class="rounded-lg ma-1 d-flex justify-center sidebar-actions pa-2"
	>
		<v-icon :color="color">{{ icon }}</v-icon>
	</div>
</template>

<script>
export default {
	props: {
		color: String,
		icon: String,
	},
}
</script>

<style scoped>
.sidebar-actions {
	cursor: pointer;
	transition: all 0.1s ease-in-out;
	background-color: var(--v-sidebarSelection-base);
}
</style>
