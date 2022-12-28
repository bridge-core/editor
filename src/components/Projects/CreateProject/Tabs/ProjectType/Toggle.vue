<template>
	<ToggleSheet :isToggleable="!selected" :value="selected" @input="onClick">
		<div class="d-flex">
			<v-icon color="accent" class="mr-2">
				{{ icon }}
			</v-icon>

			<h1 class="pack-type-header">
				{{ t(`windows.projectChooser.${type}Project.name`) }}
			</h1>
		</div>

		<SelectedStatus :selected="selected" />

		<span>{{
			t(`windows.projectChooser.${type}Project.description`)
		}}</span>
	</ToggleSheet>
</template>

<script>
import { toRefs } from 'vue'
import ToggleSheet from '/@/components/UIElements/ToggleSheet.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import SelectedStatus from '/@/components/UIElements/SelectedStatus.vue'

export default {
	mixins: [TranslationMixin],
	components: {
		ToggleSheet,
		SelectedStatus,
	},
	props: {
		type: String,
		icon: String,
		selected: Boolean,
	},
	methods: {
		onClick() {
			if (this.selected) return

			this.$emit('input')
		},
	},
}
</script>

<style scoped>
.content-area {
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
.pack-type-header {
	font-size: 1.25rem !important;
	font-weight: 500;
	letter-spacing: 0.0125em !important;
}
</style>
