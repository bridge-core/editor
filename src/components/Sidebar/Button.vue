<template>
	<v-tooltip
		:color="color ? color : 'tooltip'"
		:disabled="hasClicked"
		:right="!isSidebarRight"
		:left="isSidebarRight"
	>
		<template v-slot:activator="{ on }">
			<div
				class="rounded-lg ma-2 d-flex justify-center sidebar-button"
				:style="{
					'background-color': computedColor,
					transform: isSelected ? 'scale(1.1)' : undefined,
				}"
				:class="{
					loading: isLoading,
					'pa-1': smallerSidebarElements,
					'pa-2': !smallerSidebarElements,
					'elevation-4': isSelected,
				}"
				v-on="on"
				@click="onClick"
				@click.middle="onMiddleClick"
				v-ripple="alwaysAllowClick || !isLoading"
			>
				<v-icon
					:style="{
						position: isLoading ? 'absolute' : 'relative',
						margin: isLoading ? '4px' : 0,
					}"
					:color="isLoading ? 'white' : iconColor"
					:small="isLoading"
				>
					{{ icon }}
				</v-icon>
				<slot v-if="isLoading">
					<v-progress-circular
						size="24"
						width="2"
						color="white"
						indeterminate
					/>
				</slot>
			</div>
		</template>

		<span>{{ t(displayName) }}</span>
	</v-tooltip>
</template>

<script>
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'SidebarButton',
	mixins: [TranslationMixin],
	props: {
		displayName: String,
		icon: String,
		iconColor: String,
		color: String,

		isLoading: {
			type: Boolean,
			default: false,
		},
		isSelected: {
			type: Boolean,
			default: false,
		},
		alwaysAllowClick: {
			type: Boolean,
			default: false,
		},
		opacity: {
			type: Number,
			default: 1,
		},
	},
	data: () => ({
		settingsState,
		hasClicked: false,
	}),
	computed: {
		isSidebarRight() {
			return (
				this.settingsState &&
				this.settingsState.sidebar &&
				this.settingsState.sidebar.isSidebarRight
			)
		},
		smallerSidebarElements() {
			return (
				this.settingsState &&
				this.settingsState.sidebar &&
				this.settingsState.sidebar.smallerSidebarElements
			)
		},
		computedColor() {
			if (this.color)
				return this.color.startsWith('#')
					? this.color
					: `var(--v-${this.color}-base)`
			return this.isLoading || this.isSelected
				? `var(--v-primary-base)`
				: `var(--v-sidebarSelection-base)`
		},
	},
	methods: {
		onClick() {
			if (this.alwaysAllowClick || !this.isLoading) {
				this.$emit('click')

				// Otherwise the tooltip can get stuck until the user hovers over the button again
				this.hasClicked = true
				this.$nextTick(() => (this.hasClicked = false))
			}
		},
		onMiddleClick() {
			if (this.alwaysAllowClick || !this.isLoading) {
				this.$emit('middleClick')

				// Otherwise the tooltip can get stuck until the user hovers over the button again
				this.hasClicked = true
				this.$nextTick(() => (this.hasClicked = false))
			}
		},
	},
}
</script>

<style scoped>
.sidebar-button {
	cursor: pointer;
	transition: all 0.1s ease-in-out;
}
</style>
