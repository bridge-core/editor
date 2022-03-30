<template>
	<v-tooltip
		:color="color || 'tooltip'"
		:disabled="$vuetify.display.mobile"
		:open-delay="500"
		bottom
	>
		<template v-slot:activator="{ props }">
			<div
				v-ripple
				class="rounded-lg ma-1 d-flex justify-center sidebar-actions pa-2"
				:class="{ 'elevation-4': isSelected }"
				:style="{
					background: isSelected
						? `rgb(var(--v-theme-${color}))`
						: null,
					transform: isSelected ? 'scale(1.05)' : null,
				}"
				@click="$emit('click', $event)"
				v-bind="props"
			>
				<v-icon :color="isSelected ? 'white' : color">
					{{ icon }}
				</v-icon>
			</div>
		</template>
		<span>{{ t(name) }}</span>
	</v-tooltip>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		color: String,
		icon: String,
		name: String,
		isSelected: Boolean,
	},
}
</script>

<style scoped>
.sidebar-actions {
	cursor: pointer;
	transition: all 0.1s ease-in-out;
	background-color: rgb(var(--v-theme-sidebarSelection));
}
</style>
