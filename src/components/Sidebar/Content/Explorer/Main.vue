<template>
	<v-treeview
		v-if="directoryEntry"
		v-model="tree"
		:items="directoryEntry.children"
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
import { mainTabSystem } from '@/components/TabSystem/Common'
import { DirectoryEntry } from './DirectoryEntry'
import { TextTab } from '@/components/Editors/Text/TextTab'

export default {
	name: 'FileExplorer',

	async mounted() {
		this.directoryEntry = await DirectoryEntry.create()
		setTimeout(
			() =>
				mainTabSystem.add(
					new TextTab(
						mainTabSystem,
						this.directoryEntry.children[4]
					).select()
				),
			1000
		)
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
