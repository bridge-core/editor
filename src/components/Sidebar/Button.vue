<template>
	<v-tooltip
		:color="color ? color : 'tooltip'"
		:disabled="hasClicked || isSelected"
		:right="!isSidebarRight"
		:left="isSidebarRight"
	>
		<template v-slot:activator="{ on }">
			<div
				class="rounded ma-2 d-flex justify-center sidebar-button"
				:style="{
					'background-color': computedColor,
					position: 'relative',
					transform: isSelected ? 'scale(1.1)' : undefined,
					cursor: canInteractWith ? 'pointer' : undefined,
					height: smallerSidebarElements ? `34px` : `40px`,
					width: smallerSidebarElements ? `34px` : `40px`,
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
				v-ripple="canInteractWith"
			>
				<v-badge
					:value="badge && !isLoading ? badge.count : 0"
					:content="badge && !badge.icon ? badge.count : 0"
					:color="badge ? badge.color : null"
					:icon="badge ? badge.icon : null"
					:dot="badge && badge.dot"
					:style="{
						position: isLoading ? 'absolute' : 'relative',
						marginTop: isLoading ? '3px' : 0,
						marginLeft: isLoading ? '1px' : 0,
					}"
					overlap
					bordered
				>
					<v-icon
						:color="isLoading || isSelected ? 'white' : iconColor"
						:small="isLoading"
						:style="{
							opacity: disabled ? 0.4 : undefined,
						}"
					>
						{{ icon }}
					</v-icon>
				</v-badge>

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
import { useTranslations } from '/@/components/Composables/useTranslations.ts'

export default {
	name: 'SidebarButton',
	props: {
		displayName: String,
		icon: String,
		iconColor: String,
		color: String,

		disabled: {
			type: Boolean,
			default: false,
		},
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
		badge: Object,
	},
	setup() {
		const { t } = useTranslations()
		return {
			t,
		}
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
		canInteractWith() {
			return !this.disabled && (this.alwaysAllowClick || !this.isLoading)
		},
	},
	methods: {
		onClick(event) {
			if (this.disabled) return

			if (this.alwaysAllowClick || !this.isLoading) {
				this.$emit('click', event)

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
	transition: all 0.1s ease-in-out;
}
</style>
