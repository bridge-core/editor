<template>
	<div v-if="directoryEntry && directoryEntry.name === undefined">
		<!-- <template v-for="entry in directoryEntry.children">
			<Folder
				v-if="!entry.isFile"
				:key="entry.uuid"
				:directoryEntry="entry"
			/>
		</template> -->
		<v-treeview
			v-model="tree"
			:items="directoryEntry.children"
			activatable
			item-key="name"
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
	</div>
</template>

<script>
import { DirectoryEntry } from './DirectoryEntry'
import Folder from './Folder.vue'

export default {
	name: 'FileExplorer',
	components: {
		Folder,
	},

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
