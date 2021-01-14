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
			:loading="!packIndexerReady.isReady || loadingPackExplorer"
			color="primary"
			block
		>
			<v-icon class="pr-2">mdi-folder-open</v-icon> View All
		</v-btn>

		<ChooseProject />
	</div>
</template>

<script>
import { App } from '@/App.ts'
import ChooseProject from './ChooseProject.vue'
import { packIndexerReady } from '@/components/PackIndexer/PackIndexer.ts'
import { createPackExplorer } from '@/components/Windows/Project/PackExplorer/PackExplorer.ts'

export default {
	name: 'PackExplorer',
	components: { ChooseProject },
	data: () => ({
		packIndexerReady,
		recentlyViewed: null,
		recentlyEdited: null,
		loadingPackExplorer: false,
	}),
	methods: {
		async openPackExplorer() {
			this.loadingPackExplorer = true
			await App.instance.windows.packExplorer.open()
			this.loadingPackExplorer = false
		},
		chooseProject() {},
	},
}
</script>

<style></style>
