<template>
	<v-btn @click="chooseProject" block :loading="!packIndexerReady.isReady">
		Choose project
	</v-btn>
</template>

<script>
import { App } from '@/App.ts'
import { getProjects, selectProject } from '@/components/Project/Loader.ts'
import { createDropdownWindow } from '@/components/Windows/Common/CommonDefinitions.ts'
import { get } from 'idb-keyval'
import { packIndexerReady } from '@/components/LightningCache/PackIndexer'

export default {
	data: () => ({
		packIndexerReady,
	}),
	methods: {
		chooseProject() {
			App.instance.windows.projectChooserWindow.open()
		},
	},
}
</script>

<style></style>
