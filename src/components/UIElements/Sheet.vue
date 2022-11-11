<template>
	<div
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
		onClick: Function,
	},
	computed: {
		hasClickListener() {
			return !!this.onClick
		},
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
