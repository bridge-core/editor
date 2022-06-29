<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.createProject.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="!isFirstProject"
		:isFullscreen="false"
		:isPersistent="isCreatingProject || isFirstProject"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="close"
	>
		<template #default>
			<!-- Welcome text for users getting started with bridge. -->

			<BridgeSheet class="pa-3 mb-2" v-if="isFirstProject">
				<h1>
					{{ t('windows.createProject.welcome') }}
				</h1>
				<span>
					{{ t('windows.createProject.welcomeDescription') }}
				</span>
			</BridgeSheet>

			<v-row class="mb-6" dense>
				<v-col
					v-for="packType in availablePackTypes"
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
						:selected="createOptions.packs.includes(packType.id)"
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
									createOptions.rpAsBpDependency ||
									createOptions.packs.includes('resourcePack')
								"
								@click.stop="
									createOptions.bpAsRpDependency = !createOptions.bpAsRpDependency
								"
								:disabled="
									!selected ||
									!createOptions.packs.includes(
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
									createOptions.rpAsBpDependency ||
									createOptions.packs.includes('behaviorPack')
								"
								@click.stop="
									createOptions.rpAsBpDependency = !createOptions.rpAsBpDependency
								"
								:disabled="
									!selected ||
									!createOptions.packs.includes(
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
								v-for="experiment in experimentalToggles"
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
										createOptions.experimentalGameplay[
											experiment.id
										]
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
				v-if="$data.packCreateFiles.length > 0"
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
								v-for="(file, i) in $data.packCreateFiles"
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
						v-model="createOptions.icon"
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
					v-model="createOptions.name"
					:label="t('windows.createProject.projectName.name')"
					:rules="nameRules"
					autocomplete="off"
					class="ml-2"
					outlined
					dense
				/>
			</div>

			<v-textarea
				v-model="createOptions.description"
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
					v-model="createOptions.namespace"
					:label="t('windows.createProject.projectPrefix')"
					autocomplete="off"
					class="mr-2"
					outlined
					dense
				/>
				<v-text-field
					v-model="createOptions.author"
					:label="t('windows.createProject.projectAuthor')"
					autocomplete="off"
					class="mx-2"
					outlined
					dense
				/>

				<v-autocomplete
					v-model="createOptions.targetVersion"
					:label="t('windows.createProject.projectTargetVersion')"
					autocomplete="off"
					:menu-props="{
						maxHeight: 220,
						rounded: 'lg',
						'nudge-top': -8,
						transition: 'slide-y-transition',
					}"
					:items="availableTargetVersions"
					:loading="availableTargetVersionsLoading"
					class="ml-2"
					outlined
					dense
				/>
			</div>

			<div class="d-flex">
				<v-switch
					inset
					dense
					:label="t('windows.createProject.useLangForManifest')"
					:value="createOptions.useLangForManifest"
					@click.stop="
						createOptions.useLangForManifest = !createOptions.useLangForManifest
					"
					class="ma-3"
				></v-switch>
			</div>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!currentWindow.hasRequiredData || isCreatingProject"
				:loading="shouldLoad"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import PackTypeViewer from '/@/components/Data/PackTypeViewer.vue'
import ExperimentalGameplay from './ExperimentalGameplay.vue'
import CreateFile from './CreateFile.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { isFileAccepted } from '/@/utils/file/isAccepted.ts'

export default {
	name: 'CreateProjectWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		PackTypeViewer,
		BridgeSheet,
		ExperimentalGameplay,
		CreateFile,
	},
	props: ['currentWindow'],

	data() {
		return this.currentWindow
	},
	computed: {
		shouldLoad() {
			// If this is the first project, only show a spinner while creating the spinner
			if (this.isFirstProject) return this.isCreatingProject
			// Otherwise check that the compiler & pack indexer are done too
			return this.isCreatingProject
		},
		nameRules() {
			return this.projectNameRules.map((rule) => (val) => {
				const res = rule(val)
				if (res === true) return true

				return this.t(res)
			})
		},
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		async createProject() {
			this.isCreatingProject = true
			await this.currentWindow.createProject()
			this.isCreatingProject = false
			this.currentWindow.close()
		},
		togglePack(packPath) {
			const packs = this.createOptions.packs
			const index = packs.indexOf(packPath)

			if (index > -1) packs.splice(index, 1)
			else packs.push(packPath)
		},
		setModel(key, val) {
			this.createOptions[key] = val
		},
		onDropFile(event) {
			const file = event.dataTransfer.files[0]
			if (!isFileAccepted(file, 'image/png')) return

			this.createOptions.icon = file
		},
	},
}
</script>

<style scoped>
.content-area {
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid rgb(var(--v-theme-primary));
}
</style>
