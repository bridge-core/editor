<template>
	<v-btn @click="chooseProject" block>
		Choose project
	</v-btn>
</template>

<script>
import { getProjects, selectProject } from '@/components/Project/Loader.ts'
import { createDropdownWindow } from '@/components/Windows/Common/CommonDefinitions.ts'
import { get } from 'idb-keyval'

export default {
	methods: {
		async chooseProject() {
			const projects = await getProjects()
			const selectedProject = await get('selectedProject')

			const chooseWindow = createDropdownWindow(
				'Choose Project',
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
