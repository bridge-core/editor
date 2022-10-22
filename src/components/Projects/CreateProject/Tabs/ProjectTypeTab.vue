<template>
	<div>
		<h2 class="mb-2">Project Type</h2>

		<v-row class="mb-6" dense>
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

		<h2 class="mb-2">Packs</h2>
		<v-row class="mb-6" dense>
			<v-col
				v-for="packType in window.availablePackTypes"
				:key="packType.id"
				cols="12"
				xs="12"
				sm="6"
				md="6"
				lg="3"
				xl="3"
			>
				<PackTypeViewer
					:packType="packType"
					isSelectable
					style="height: 100%"
					:selected="state.createOptions.packs.includes(packType.id)"
					@click="togglePack(packType.id)"
				>
					<template
						v-if="packType.id === 'behaviorPack'"
						#default="{ selected }"
					>
						<!-- I am not sure why the bpAsRpDependency toggle needs an OR here but it seems to work correctly & fixes an issue where the user had to click the toggle twice -->
						<v-switch
							inset
							dense
							:label="t('windows.createProject.bpAsRpDependency')"
							:value="
								state.createOptions.rpAsBpDependency ||
								state.createOptions.packs.includes(
									'resourcePack'
								)
							"
							@click.stop.native="
								state.createOptions.bpAsRpDependency =
									!state.createOptions.bpAsRpDependency
							"
							:disabled="
								!selected ||
								!state.createOptions.packs.includes(
									'resourcePack'
								)
							"
							class="mt-3"
						/>
					</template>
					<template
						v-else-if="packType.id === 'resourcePack'"
						#default="{ selected }"
					>
						<!-- I am not sure why the rpAsBpDependency toggle needs an OR here but it seems to work correctly & fixes an issue where the user had to click the toggle twice -->
						<v-switch
							inset
							dense
							:label="t('windows.createProject.rpAsBpDependency')"
							:value="
								state.createOptions.rpAsBpDependency ||
								state.createOptions.packs.includes(
									'behaviorPack'
								)
							"
							@click.stop.native="
								state.createOptions.rpAsBpDependency =
									!state.createOptions.rpAsBpDependency
							"
							:disabled="
								!selected ||
								!state.createOptions.packs.includes(
									'behaviorPack'
								)
							"
							class="mt-3"
						/>
					</template>
				</PackTypeViewer>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup>
import PackTypeViewer from '/@/components/Data/PackTypeViewer.vue'
import ProjectTypeViewer from './ProjectTypeViewer.vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import { projectTypes } from '../ProjectTypes'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state

function togglePack(packPath: string) {
	const packs = state.createOptions.packs
	const index = packs.indexOf(packPath)

	if (index > -1) packs.splice(index, 1)
	else packs.push(packPath)
}
</script>
