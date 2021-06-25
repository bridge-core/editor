<template>
	<div
		v-ripple
		class="rounded-lg ma-1 d-flex justify-center sidebar-actions pa-2"
		:class="{ 'elevation-4': isSelected }"
		:style="{
			background: isSelected ? `var(--v-${color}-base)` : null,
			transform: isSelected ? 'scale(1.05)' : null,
		}"
		@click="$emit('click', $event)"
	>
		<v-icon :color="isSelected ? 'white' : color">{{ icon }}</v-icon>
	</div>
</template>

<script>
export default {
	props: {
		color: String,
		icon: String,
		isSelected: Boolean,
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
