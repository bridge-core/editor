<template>
	<div
		v-on="nonClickListeners"
		class="rounded-lg"
		:class="{ 'bg-dark': dark, bg: !dark }"
		@click="isLoading ? null : $emit('click')"
		v-ripple="hasClickListener && !isLoading"
	>
		<v-progress-circular v-if="isLoading" color="accent" indeterminate />
		<slot v-else />
	</div>
</template>

<script>
export default {
	name: 'BridgeSheet',
	props: {
		dark: Boolean,
		isLoading: Boolean,
	},
	computed: {
		nonClickListeners() {
			return Object.fromEntries(
				Object.entries(this.$listeners).filter(
					([key, value]) => key !== 'click'
				)
			)
		},
		hasClickListener() {
			return !!this.$listeners.click
		},
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
