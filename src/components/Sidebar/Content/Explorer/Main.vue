<template>
	<v-treeview
		v-if="directoryEntry"
		v-model="tree"
		:items="directoryEntry.children"
		activatable
		item-key="uuid"
		expand-icon="mdi-chevron-down"
		open-on-click
		transition
		dense
	>
		<template v-slot:prepend="{ item, open }">
			<v-icon small v-if="!item.isFile">
				{{ open ? 'mdi-folder-open' : 'mdi-folder' }}
			</v-icon>
			<v-icon small v-else>
				mdi-file
			</v-icon>
		</template>
	</v-treeview>
</template>

<script>
import { DirectoryEntry } from './DirectoryEntry'

export default {
	name: 'FileExplorer',

	async mounted() {
		this.directoryEntry = await DirectoryEntry.create()
	},
	data: () => ({
		directoryEntry: null,
		tree: [],
	}),
}
</script>

<style>
.v-treeview--dense .v-treeview-node__root {
	min-height: 20px !important;
	padding: 0;
}
.v-treeview-node__level {
	width: 0.75em !important;
}
</style>
