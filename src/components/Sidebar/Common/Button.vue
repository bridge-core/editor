<template>
	<v-tooltip color="tooltip" :disabled="isSelected" right>
		<template v-slot:activator="{ on }">
			<div
				class="rounded-lg pa-2 ma-2 d-flex justify-center"
				:style="{
					'background-color': isSelected
						? 'var(--v-primary-base)'
						: 'var(--v-sidebarSelection-base)',
				}"
				v-on="on"
				@click="$emit('click')"
				v-ripple
			>
				<v-icon>{{ icon }}</v-icon>
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
		opacity: {
			type: Number,
			default: 1,
		},
	},
}
</script>

<style scoped>
span {
	cursor: pointer;
}
</style>
