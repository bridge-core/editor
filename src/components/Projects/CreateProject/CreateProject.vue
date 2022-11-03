<template>
	<BaseWindow
		v-if="state.shouldRender"
		windowTitle="windows.createProject.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="!window.isFirstProject"
		:isFullscreen="false"
		:isPersistent="state.isCreatingProject || window.isFirstProject"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="close"
	>
		<template #default>
			<!-- Welcome text for users getting started with bridge. -->

			<BridgeSheet class="pa-3 mb-2" v-if="window.isFirstProject">
				<h1>
					{{ t('windows.createProject.welcome') }}
				</h1>
				<span>
					{{ t('windows.createProject.welcomeDescription') }}
				</span>
			</BridgeSheet>

			<v-row class="mb-6" dense>
				<v-col
					v-for="packType in window.availablePackTypes"
					:key="packType.id"
					xs="12"
					sm="6"
					md="4"
					lg="3"
					xl="2"
				>
					<PackTypeViewer
						:packType="packType"
						isSelectable
						style="height: 100%"
						:selected="
							state.createOptions.packs.includes(packType.id)
						"
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
								:label="
									t('windows.createProject.bpAsRpDependency')
								"
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
								:label="
									t('windows.createProject.rpAsBpDependency')
								"
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

			<!-- Experimental Gameplay Toggles -->
			<v-expansion-panels class="mb-6">
				<v-expansion-panel>
					<v-expansion-panel-header
						color="expandedSidebar"
						expand-icon="mdi-menu-down"
					>
						{{ t('general.experimentalGameplay') }}
					</v-expansion-panel-header>
					<v-expansion-panel-content color="expandedSidebar">
						<v-row dense>
							<v-col
								v-for="experiment in window.experimentalToggles"
								:key="experiment.id"
								xs="12"
								sm="6"
								md="4"
								lg="3"
								xl="2"
							>
								<ExperimentalGameplay
									:experiment="experiment"
									v-model="
										state.createOptions
											.experimentalGameplay[experiment.id]
									"
									style="height: 100%"
								/>
							</v-col>
						</v-row>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-expansion-panels>

			<!-- Toggle Creation of individual files -->
			<v-expansion-panels
				v-if="window.packCreateFiles.length > 0"
				class="mb-6"
			>
				<v-expansion-panel>
					<v-expansion-panel-header
						color="expandedSidebar"
						expand-icon="mdi-menu-down"
					>
						{{ t('windows.createProject.individualFiles.name') }}
					</v-expansion-panel-header>
					<v-expansion-panel-content color="expandedSidebar">
						<v-row dense>
							<v-col
								v-for="(file, i) in window.packCreateFiles"
								:key="`${i}-${file.id}`"
								xs="12"
								sm="6"
								md="4"
								lg="3"
								xl="3"
							>
								<CreateFile
									:file="file"
									v-model="file.isActive"
									style="height: 100%"
								/>
							</v-col>
						</v-row>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-expansion-panels>

			<div class="d-flex">
				<div
					style="width: 40%"
					@drop.prevent.stop="onDropFile"
					@dragover.prevent.stop
				>
					<v-file-input
						v-model="state.createOptions.icon"
						:label="t('windows.createProject.packIcon')"
						:prepend-icon="null"
						prepend-inner-icon="mdi-image-outline"
						accept="image/png"
						class="mr-2"
						outlined
						dense
					/>
				</div>

				<v-text-field
					v-model="state.createOptions.name"
					:label="t('windows.createProject.projectName.name')"
					:rules="nameRules"
					autocomplete="off"
					class="ml-2"
					outlined
					dense
				/>
			</div>

			<v-textarea
				v-model="state.createOptions.description"
				:label="t('windows.createProject.projectDescription')"
				autocomplete="off"
				auto-grow
				rows="1"
				counter
				outlined
				dense
			/>

			<div class="d-flex">
				<v-text-field
					v-model="state.createOptions.namespace"
					:label="t('windows.createProject.projectPrefix')"
					autocomplete="off"
					class="mr-2"
					outlined
					dense
				/>
				<v-text-field
					v-model="state.createOptions.author"
					:label="t('windows.createProject.projectAuthor')"
					autocomplete="off"
					class="mx-2"
					outlined
					dense
				/>

				<v-autocomplete
					v-model="state.createOptions.targetVersion"
					:label="t('windows.createProject.projectTargetVersion')"
					autocomplete="off"
					:menu-props="{
						maxHeight: 220,
						rounded: 'lg',
						'nudge-top': -8,
						transition: 'slide-y-transition',
					}"
					:items="window.availableTargetVersions"
					:loading="state.availableTargetVersionsLoading"
					class="ml-2"
					outlined
					dense
				/>
			</div>

			<div class="d-flex flex-column">
				<v-switch
					inset
					dense
					:label="t('windows.createProject.useLangForManifest')"
					v-model="state.createOptions.useLangForManifest"
				></v-switch>
				<v-switch
					inset
					dense
					:label="t('windows.createProject.bdsProject')"
					v-model="state.createOptions.bdsProject"
				></v-switch>
			</div>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!window.hasRequiredData || state.isCreatingProject"
				:loading="state.isCreatingProject"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import PackTypeViewer from '/@/components/Data/PackTypeViewer.vue'
import ExperimentalGameplay from './ExperimentalGameplay.vue'
import CreateFile from './CreateFile.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { isFileAccepted } from '/@/utils/file/isAccepted'
import { useTranslations } from '../../Composables/useTranslations'
import { computed } from 'vue'

const { t } = useTranslations()
const props = defineProps(['window'])
const state = props.window.state

const nameRules = computed(() => {
	return props.window.projectNameRules.map((rule: any) => (val: any) => {
		const res = rule(val)
		if (res === true) return true

		return t(res)
	})
})

async function createProject() {
	state.isCreatingProject = true
	await props.window.createProject()
	state.isCreatingProject = false
	props.window.close()
}
function close() {
	props.window.close()
}

function togglePack(packPath: string) {
	const packs = state.createOptions.packs
	const index = packs.indexOf(packPath)

	if (index > -1) packs.splice(index, 1)
	else packs.push(packPath)
}

function onDropFile(event: DragEvent) {
	const file = event.dataTransfer?.files[0]
	if (!file || !isFileAccepted(file, 'image/png')) return

	state.createOptions.icon = file
}
</script>

<style scoped>
.content-area {
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
</style>
