<template>
	<div
		class="pa-1 rounded-lg category"
		:class="{ selected: isSelected, 'is-disabled': isDisabled }"
		v-ripple="!isSelected && !isDisabled"
		@click="!isDisabled ? $emit('click') : undefined"
	>
		<v-tooltip :disabled="!status.showStatus" right color="tooltip">
			<template v-slot:activator="{ on }">
				<!-- Flexbox doesn't work directly on summaries in Safari -->
				<span
					v-on="on"
					class="d-flex align-center"
					:class="{ 'justify-center': compact }"
				>
					<v-icon
						:color="isDisabled ? null : color"
						:class="{ 'pr-1': !compact }"
						:style="{ 'font-size': `${compact ? 30 : 22}px` }"
					>
						{{ icon }}
					</v-icon>
					<span v-if="!compact">{{ text }}</span>
					<v-spacer v-if="status.showStatus" />
					<v-icon v-if="status.showStatus" small color="error">
						{{ status.icon ?? 'mdi-alert-circle-outline' }}
					</v-icon>
				</span>
			</template>
			<span>{{
				status.message || t('windows.sidebar.disabledItem')
			}}</span>
		</v-tooltip>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'SidebarItem',
	mixins: [TranslationMixin],

	props: {
		isSelected: Boolean,
		isDisabled: Boolean,
		status: Object,
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
.category:not(.selected):not(.is-disabled) {
	opacity: 0.7;
	cursor: pointer;
}
.is-disabled {
	opacity: 0.4;
}
</style>
