<template>
	<ToggleSheet
		:value="value"
		@input="$emit('input', $event)"
		:dark="true"
		:isToggleable="isToggleable"
		@click.native="onClick"
	>
		<template #default="{ value }">
			<div class="d-flex align-center">
				<v-icon color="primary" class="mr-1">
					{{ experiment.icon }}
				</v-icon>

				<h1 class="experimental-gameplay-header">
					{{ t(`experimentalGameplay.${experiment.id}.name`) }}
				</h1>
			</div>

			<SelectedStatus :selected="value" />

			<p v-if="!dense">
				{{ t(`experimentalGameplay.${experiment.id}.description`) }}
			</p>
		</template>
	</ToggleSheet>
</template>

<script>
import ToggleSheet from '/@/components/UIElements/ToggleSheet.vue'
import SelectedStatus from '/@/components/UIElements/SelectedStatus.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'

export default {
	name: 'ExperimentalGameplay',
	mixins: [TranslationMixin],
	components: {
		ToggleSheet,
		SelectedStatus,
	},
	props: {
		experiment: {
			type: Object,
			required: true,
		},
		isToggleable: {
			type: Boolean,
			default: true,
		},
		value: Boolean,
		dense: Boolean,
	},
	methods: {
		onClick() {
			if (this.experiment.id == 'holidayCreatorFeatures') {
				if (this.value == false) return
				new InformationWindow({
					title: 'experimentalGameplay.experimentDeprecation.title',
					description:
						'experimentalGameplay.experimentDeprecation.hcfDescription',
				})
			}
		},
	},
}
</script>

<style scoped>
.experimental-gameplay-header {
	font-size: 1.25rem !important;
	font-weight: 500;
	letter-spacing: 0.0125em !important;
}
</style>
