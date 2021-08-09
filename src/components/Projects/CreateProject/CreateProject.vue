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

			<div
				class="rounded-lg pa-3 content-area mb-2"
				v-if="isFirstProject"
			>
				<h1 class="text-h4">
					{{ t('windows.createProject.welcome') }}
				</h1>
				<span>
					{{ t('windows.createProject.welcomeDescription') }}
				</span>
			</div>

			<v-row class="mb-6" no-gutters>
				<PackTypeViewer
					v-for="(packType, i) in availablePackTypes"
					:class="{
						'mr-1': i === 0,
						'ml-1': i + 1 === availablePackTypes.length,
						'mx-1': i > 0 && i + 1 < availablePackTypes.length,
					}"
					:key="packType.id"
					:packType="packType"
					isSelectable
					:selected="createOptions.packs.includes(packType.id)"
					@click="togglePack(packType.id)"
				>
					<template
						v-if="packType.id === 'behaviorPack'"
						#default="{ selected }"
					>
						<v-switch
							inset
							dense
							:label="t('windows.createProject.scripting')"
							:value="createOptions.scripting"
							@click.stop.native="
								createOptions.scripting = !createOptions.scripting
							"
							:disabled="!selected"
							class="mt-3"
						/>
						<v-switch
							inset
							dense
							:label="t('windows.createProject.gameTest')"
							:value="createOptions.gameTest"
							@click.stop.native="
								createOptions.gameTest = !createOptions.gameTest
							"
							:disabled="!selected"
							class="ma-0"
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
								createOptions.rpAsBpDependency ||
								createOptions.packs.includes('behaviorPack')
							"
							@click.stop.native="
								createOptions.rpAsBpDependency = !createOptions.rpAsBpDependency
							"
							:disabled="
								!selected ||
								!createOptions.packs.includes('behaviorPack')
							"
							class="mt-3"
						/>
					</template>
				</PackTypeViewer>
			</v-row>

			<div class="d-flex">
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
				<v-text-field
					v-model="createOptions.name"
					:label="t('windows.createProject.projectName')"
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
					:items="availableTargetVersions"
					:loading="availableTargetVersionsLoading"
					class="ml-2"
					outlined
					dense
					:menu-props="{ maxHeight: 220 }"
				/>
			</div>
			<div class="d-flex">
				<v-switch
					inset
					dense
					:label="t('windows.createProject.useLangForManifest')"
					:value="createOptions.useLangForManifest"
					@click.stop.native="
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
				:disabled="!currentWindow.hasRequiredData"
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

export default {
	name: 'CreateProjectWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
		PackTypeViewer,
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
	},
}
</script>

<style scoped>
.content-area {
	background-color: var(--v-sidebarNavigation-base);
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
</style>
