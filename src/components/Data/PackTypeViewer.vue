<template>
	<BridgeSheet
		:class="{
			'rounded-lg pa-3 content-area': true,
			selected: selected,
		}"
		v-ripple="isSelectable"
		@click.stop.native="$emit('click')"
	>
		<div class="d-flex">
			<v-icon :color="packType.color" class="mr-2">
				{{ packType.icon }}
			</v-icon>

			<h1 class="pack-type-header">
				{{ t(`packType.${packType.id}.name`) }}
			</h1>
		</div>

		<SelectedStatus v-if="isSelectable" :selected="selected" />

		<div v-if="packType.version" class="mb-2">
			Pack Version: v{{ packType.version.join('.') }}
		</div>

		<span>{{ t(`packType.${packType.id}.description`) }}</span>

		<slot :selected="selected" />
	</BridgeSheet>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import SelectedStatus from '/@/components/UIElements/SelectedStatus.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export default {
	name: 'PackTypeViewer',
	mixins: [TranslationMixin],
	components: {
		SelectedStatus,
		BridgeSheet,
	},
	props: {
		packType: Object,
		selected: Boolean,
		isSelectable: Boolean,
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
