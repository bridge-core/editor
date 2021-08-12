<template>
	<v-btn
		@click="action.trigger()"
		:style="platform === 'darwin' ? `border-radius: 8px` : undefined"
		:text="!minimalDisplay"
		small
		:icon="minimalDisplay"
	>
		<v-icon
			color="primary"
			:class="{ 'mr-1': true, 'ml-1': minimalDisplay }"
			small
		>
			{{ action.icon }}
		</v-icon>
		<span
			v-if="!minimalDisplay"
			:style="{
				'text-transform': 'none',
				'font-weight': 'unset',
				color: isDarkMode
					? 'rgba(255, 255, 255, 0.7)'
					: 'rgba(0, 0, 0, 0.6)',
			}"
		>
			{{ t(action.name) }}
		</span>
	</v-btn>
</template>

<script>
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { platform } from '/@/utils/os'

export default {
	mixins: [TranslationMixin],
	props: {
		action: SimpleAction,
	},
	data: () => ({
		platform: platform(),
	}),
	computed: {
		minimalDisplay() {
			return !this.$vuetify.breakpoint.mdAndUp
		},
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>

<style></style>
