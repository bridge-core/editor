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
	</div>
</template>

<script>
import { packIndexerReady } from '@/components/LightningCache/PackIndexer'
import { createPackExplorer } from './Window/PackExplorer'

export default {
	name: 'PackExplorer',
	data: () => ({
		packIndexerReady,
		recentlyViewed: null,
		recentlyEdited: null,
	}),
	methods: {
		openPackExplorer() {
			createPackExplorer()
		},
	},
}
</script>

<style></style>
