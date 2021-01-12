<template>
	<div>
		<div v-if="recentlyViewed">
			<h2>Recently Viewed</h2>
		</div>

		<div v-if="recentlyEdited">
			<h2>Recently Edited</h2>
		</div>

		<v-btn
			@click="openPackExplorer"
			:loading="!packIndexerReady.isReady"
			color="primary"
			block
		>
			<v-icon class="pr-2">mdi-folder-open</v-icon> View All
		</v-btn>

		<ChooseProject />
	</div>
</template>

<script>
import ChooseProject from './ChooseProject.vue'
import { packIndexerReady } from '@/components/LightningCache/PackIndexer.ts'
import { createProjectExplorer } from '@/components/Windows/Project/Explorer/ProjectExplorer.ts'

export default {
	name: 'PackExplorer',
	components: { ChooseProject },
	data: () => ({
		packIndexerReady,
		recentlyViewed: null,
		recentlyEdited: null,
	}),
	methods: {
		openPackExplorer() {
			createProjectExplorer()
		},
		chooseProject() {},
	},
}
</script>

<style></style>
