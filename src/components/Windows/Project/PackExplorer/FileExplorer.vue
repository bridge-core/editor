<template>
	<!-- body-1 class sets the font-size -->
	<div class="body-1" v-if="directoryEntry && packIndexerReady.isReady">
		<template v-for="entry in directoryEntry.children">
			<details
				v-if="!entry.isFile"
				:key="entry.uuid"
				:open="entry.isFolderOpen"
			>
				<summary
					class="d-flex"
					@click.prevent="onClick(entry)"
					v-ripple
				>
					<v-icon class="pr-1" :color="entry.color" small>
						{{
							entry.isFolderOpen
								? 'mdi-folder-open'
								: 'mdi-folder'
						}}
					</v-icon>
					<span class="folder">{{ entry.name }}</span>
				</summary>

				<FileExplorer
					@closeWindow="$emit('closeWindow')"
					:entry="entry"
				/>
			</details>
			<!--FILE-->
			<div
				v-else
				:key="entry.uuid"
				class="file"
				@click.stop="onClick(entry)"
				v-ripple
			>
				<v-icon :color="entry.color" small>
					{{ entry.icon || 'mdi-file-outline' }}
				</v-icon>
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
import { App } from '@/App.ts'
import { packIndexerReady } from '@/components/LightningCache/PackIndexer'

export default {
	name: 'FileExplorer',
	props: {
		entry: Object,
		startPath: String,
	},

	mounted() {
		this.loadDirectory()
	},
	data: () => ({
		directoryEntry: null,
		tree: [],
		packIndexerReady,
	}),
	methods: {
		loadDirectory() {
			if (!this.entry) {
				App.instance.packIndexer.once(async () => {
					this.directoryEntry = await DirectoryEntry.create([
						this.startPath,
					])
				})
			} else {
				this.directoryEntry = this.entry
			}
		},
		onClick(entry) {
			const shouldCloseWindow = entry.open()
			if (shouldCloseWindow) this.$emit('closeWindow')
		},
	},
	watch: {
		startPath() {
			this.loadDirectory()
		},
	},
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
