<template>
	<div v-if="directoryEntry">
		<template v-for="entry in directoryEntry.children">
			<details
				v-if="!entry.isFile"
				:key="entry.uuid"
				:open="entry.isFolderOpen"
			>
				<summary @click.prevent="entry.open()" v-ripple>
					<v-icon class="open pr-1" small>mdi-folder-open</v-icon>
					<v-icon class="closed pr-1" small>mdi-folder</v-icon>
					<span class="folder">{{ entry.name }}</span>
				</summary>

				<FileExplorer :entry="entry" />
			</details>
			<!--FILE-->
			<div
				v-else
				:key="entry.uuid"
				class="file"
				@click.stop="entry.open()"
				v-ripple
			>
				<v-icon small>mdi-file</v-icon>
				{{ entry.name }}
			</div>
		</template>
	</div>

	<v-progress-linear v-else indeterminate />
</template>

<script>
import { mainTabSystem } from '@/components/TabSystem/Main'
import { DirectoryEntry } from './DirectoryEntry'
import { TextTab } from '@/components/Editors/Text/TextTab'

export default {
	name: 'FileExplorer',
	props: {
		entry: Object,
	},

	async mounted() {
		if (!this.entry) this.directoryEntry = await DirectoryEntry.create()
		else this.directoryEntry = this.entry
	},
	data: () => ({
		directoryEntry: null,
		tree: [],
	}),
}
</script>

<style scoped>
div {
	padding-left: 0.5em;
}
div.file {
	cursor: pointer;
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
}
div.file::-webkit-scrollbar,
span.folder::-webkit-scrollbar {
	width: 2px;
	height: 2px;
}
span.folder {
	overflow-x: auto;
	white-space: nowrap;
}

summary {
	outline: none;
	cursor: pointer;
	display: block;
}
details[open] > summary > .open {
	display: inline;
}
details > summary > .open {
	display: none;
}
details[open] > summary > .closed {
	display: none;
}
details > summary > .closed {
	display: inline;
}

.file-displayer {
	overflow-y: auto;
}
</style>
