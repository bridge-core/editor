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
				<v-col
					v-for="(packType, i) in availablePackTypes"
					:key="packType.id"
					:class="{
						'rounded-lg pa-3 content-area': true,
						selected: createOptions.packs.includes(
							packType.packPath
						),
						'mr-1': i === 0,
						'ml-1': i + 1 === availablePackTypes.length,
						'mx-1': i > 0 && i + 1 < availablePackTypes.length,
					}"
					v-ripple
					@click="togglePack(packType.packPath)"
				>
					<div class="d-flex">
						<v-icon :color="packType.color" class="mr-2">
							{{ packType.icon }}
						</v-icon>

						<span class="text-h6">
							{{ t(`packType.${packType.id}.name`) }}
						</span>
					</div>

					<div class="d-flex align-center mb-2">
						<template
							v-if="
								createOptions.packs.includes(packType.packPath)
							"
						>
							<v-icon color="success" class="mr-1" small>
								mdi-checkbox-marked-circle-outline
							</v-icon>
							<span>
								{{ t('windows.createProject.selectedPack') }}
							</span>
						</template>
						<template v-else>
							<v-icon class="mr-1" small>
								mdi-checkbox-blank-circle-outline
							</v-icon>
							<span>
								{{ t('windows.createProject.omitPack') }}
							</span>
						</template>
					</div>

					<span>{{ t(`packType.${packType.id}.description`) }}</span>
				</v-col>
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

			<v-text-field
				v-model="createOptions.description"
				:label="t('windows.createProject.projectDescription')"
				autocomplete="off"
				outlined
				dense
			/>

			<div class="d-flex">
				<v-text-field
					v-model="createOptions.prefix"
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
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!currentWindow.hasRequiredData"
				:loading="isCreatingProject"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import BaseWindow from '@/components/Windows/Layout/BaseWindow'

export default {
	name: 'CreateProjectWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],

	data() {
		return this.currentWindow
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
