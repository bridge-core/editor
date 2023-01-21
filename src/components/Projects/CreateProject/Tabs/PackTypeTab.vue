<template>
	<div>
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
import { useTranslations } from '/@/components/Composables/useTranslations'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state
const sidebarStatus = props.window.sidebar.currentElement.status

function togglePack(packPath: string) {
	const packs = state.createOptions.packs
	const index = packs.indexOf(packPath)

	if (index > -1) packs.splice(index, 1)
	else packs.push(packPath)

	updateStatus()
}

function updateStatus() {
	sidebarStatus.showStatus = !props.window.tabHasRequiredData('packType')
}
updateStatus()
</script>
