<template>
	<div
		class="pa-1 rounded-lg category"
		:class="{ selected: isSelected }"
		v-ripple="!isSelected"
		@click="$emit('click')"
	>
		<v-icon :color="color" class="pr-1" style="font-size: 22px;">
			{{ icon }}
		</v-icon>
		<span>{{ text }}</span>
	</div>
</template>

<script>
export default {
	name: 'SidebarItem',

	props: {
		isSelected: Boolean,
		text: String,
		icon: String,
		color: String,
	},
}
</script>

<style scoped>
.selected {
	background-color: var(--v-sidebarSelection-base);
}
.category:not(.selected) {
	opacity: 0.7;
	cursor: pointer;
}
</style>
