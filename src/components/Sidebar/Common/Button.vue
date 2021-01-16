<template>
	<v-tooltip
		:color="isLoading ? 'primary' : 'tooltip'"
		:disabled="hasClicked"
		:right="!isSidebarRight"
		:left="isSidebarRight"
	>
		<template v-slot:activator="{ on }">
			<div
				class="rounded-lg ma-2 d-flex justify-center sidebar-button"
				:class="{
					loading: isLoading,
					'pa-1': smallerSidebarElements,
					'pa-2': !smallerSidebarElements,
				}"
				v-on="on"
				@click="onClick"
				v-ripple="alwaysAllowClick || !isLoading"
			>
				<v-icon
					:style="{
						position: isLoading ? 'absolute' : 'relative',
						margin: isLoading ? '4px' : 0,
					}"
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
import { settingsState } from '@/components/Windows/Settings/SettingsState'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'SidebarButton',
	mixins: [TranslationMixin],
	props: {
		displayName: String,
		icon: String,
		color: String,

		isLoading: {
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
				this.settingsState.general &&
				this.settingsState.general.isSidebarRight
			)
		},
		smallerSidebarElements() {
			return (
				this.settingsState &&
				this.settingsState.general &&
				this.settingsState.general.smallerSidebarElements
			)
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
