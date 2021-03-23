<template>
	<v-col
		:class="{
			'rounded-lg pa-3 content-area': true,
			selected: selected,
		}"
		v-ripple="isSelectable"
		@click.stop="$emit('click')"
	>
		<div class="d-flex">
			<v-icon :color="packType.color" class="mr-2">
				{{ packType.icon }}
			</v-icon>

			<span class="text-h6">
				{{ t(`packType.${packType.id}.name`) }}
			</span>
		</div>

		<div v-if="isSelectable" class="d-flex align-center mb-2">
			<template v-if="selected">
				<v-icon color="success" class="mr-1" small>
					mdi-checkbox-marked-circle-outline
				</v-icon>
				<span>
					{{ t('windows.createProject.selectedPack') }}
				</span>
			</template>
			<template v-else>
				<v-icon class="mr-1" small>
					mdi-checkbox-blank-circle-outline
				</v-icon>
				<span>
					{{ t('windows.createProject.omitPack') }}
				</span>
			</template>
		</div>

		<div v-if="packType.version" class="mb-2">
			Pack Version: v{{ packType.version.join('.') }}
		</div>

		<span>{{ t(`packType.${packType.id}.description`) }}</span>

		<slot :selected="selected" />
	</v-col>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'PackTypeViewer',
	mixins: [TranslationMixin],
	props: {
		packType: Object,
		selected: Boolean,
		isSelectable: Boolean,
	},
}
</script>

<style scoped>
.content-area {
	background-color: var(--v-sidebarNavigation-base);
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
</style>
