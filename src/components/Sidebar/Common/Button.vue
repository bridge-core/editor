<template>
	<v-tooltip color="tooltip" :disabled="isSelected" right>
		<template v-slot:activator="{ on }">
			<div
				class="rounded-lg pa-2 ma-2 d-flex justify-center sidebar-button"
				:class="{ loading: isLoading }"
				v-on="on"
				@click="!isLoading ? $emit('click') : undefined"
				v-ripple
			>
				<v-icon v-if="!isLoading">{{ icon }}</v-icon>
				<v-progress-circular
					v-else
					size="24"
					width="2"
					color="white"
					indeterminate
				/>
			</div>
		</template>

		<span>{{ t(displayName) }}</span>
	</v-tooltip>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'SidebarButton',
	mixins: [TranslationMixin],
	props: {
		displayName: String,
		icon: String,
		color: String,
		isSelected: Boolean,
		isLoading: {
			type: Boolean,
			default: false,
		},
		opacity: {
			type: Number,
			default: 1,
		},
	},
}
</script>

<style scoped>
.sidebar-button {
	cursor: pointer;
	background-color: var(--v-sidebarSelection-base);
	transition: all 0.1s ease-in-out;
}
.sidebar-button.loading {
	background-color: var(--v-primary-base);
}
</style>
