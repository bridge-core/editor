<template>
	<ToggleSheet
		:value="value"
		@input="$emit('input', $event)"
		:dark="true"
		:isToggleable="isToggleable"
	>
		<template #default="{ value }">
			<div class="d-flex align-center">
				<v-icon color="primary" class="mr-1"> {{ file.icon }} </v-icon>

				<h1 class="individual-file-header">
					{{
						t(
							`windows.createProject.individualFiles.file.${file.id}.name`
						)
					}}
				</h1>
			</div>

			<h2 class="text-normal font-weight-light">
				{{ t(`packType.${file.packId}.name`) }}
			</h2>

			<SelectedStatus :selected="value" />

			<p>
				{{
					t(
						`windows.createProject.individualFiles.file.${file.id}.description`
					)
				}}
			</p>
		</template>
	</ToggleSheet>
</template>

<script>
import ToggleSheet from '/@/components/UIElements/ToggleSheet.vue'
import SelectedStatus from '/@/components/UIElements/SelectedStatus.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'ExperimentalGameplay',
	mixins: [TranslationMixin],
	components: {
		ToggleSheet,
		SelectedStatus,
	},
	props: {
		file: {
			type: Object,
			required: true,
		},
		isToggleable: {
			type: Boolean,
			default: true,
		},
		value: Boolean,
	},
}
</script>

<style scoped>
.individual-file-header {
	font-size: 1.25rem !important;
	font-weight: 500;
	letter-spacing: 0.0125em !important;
}
</style>
