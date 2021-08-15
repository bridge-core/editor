<template>
	<div
		class="pa-1 rounded-lg category"
		:class="{ selected: isSelected }"
		v-ripple="!isSelected"
		@click="$emit('click')"
	>
		<!-- Flexbox doesn't work directly on summaries in Safari -->
		<span
			class="d-flex align-center"
			:class="{ 'justify-center': compact }"
		>
			<v-icon
				:color="color"
				:class="{ 'pr-1': !compact }"
				:style="{ 'font-size': `${compact ? 30 : 22}px` }"
			>
				{{ icon }}
			</v-icon>
			<span v-if="!compact">{{ text }}</span>
		</span>
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
		compact: Boolean,
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
