<template>
	<div>
		<v-row class="mb-6" dense>
			<!--TODO: grey out options that aren't available for the user-->
			<v-col
				v-for="{ type, icon } in projectTypes"
				:key="`${type}#${state.createOptions.projectType}`"
				cols="12"
				xs="12"
				sm="12"
				md="4"
				lg="4"
				xl="4"
			>
				<ProjectTypeViewer
					style="height: 100%"
					:icon="icon"
					:type="type"
					:selected="state.createOptions.projectType === type"
					@input="state.createOptions.projectType = type"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup>
import ProjectTypeViewer from './Toggle.vue'
import { projectTypes } from '../../ProjectTypes'

const props = defineProps(['window'])
const state = props.window.state

function togglePack(packPath: string) {
	const packs = state.createOptions.packs
	const index = packs.indexOf(packPath)

	if (index > -1) packs.splice(index, 1)
	else packs.push(packPath)
}
</script>
