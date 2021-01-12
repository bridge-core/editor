<template>
	<v-btn @click="chooseProject" block :loading="!packIndexerReady.isReady">
		Choose project
	</v-btn>
</template>

<script>
import { getProjects, selectProject } from '@/components/Project/Loader.ts'
import { createDropdownWindow } from '@/components/Windows/Common/CommonDefinitions.ts'
import { get } from 'idb-keyval'
import { packIndexerReady } from '@/components/LightningCache/PackIndexer'

export default {
	data: () => ({
		packIndexerReady,
	}),
	methods: {
		async chooseProject() {
			const projects = await getProjects()
			const selectedProject = await get('selectedProject')

			const chooseWindow = createDropdownWindow(
				'windows.chooseProject',
				'Project...',
				projects,
				selectedProject ?? projects[0],
				async selectedProject => {
					await selectProject(selectedProject)
				}
			)
		},
	},
}
</script>

<style></style>
