<script setup lang="ts">
import SidebarWindow from '../SidebarWindow.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { Extensions } from '@/libs/extensions/Extensions'
import { ExtensionLibraryWindow } from '@/components/Windows/ExtensionLibrary/ExtensionLibrary'
import { useTranslate } from '@/libs/locales/Locales'
import Button from '@/components/Common/Button.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import { Windows } from '../Windows'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()

const isInstalledGlobal = Extensions.useIsInstalledGlobal()
const isInstalledProject = Extensions.useIsInstalledProject()
const isInstalled = Extensions.useIsInstalled()

const isMobile = useIsMobile()
</script>

<template>
	<SidebarWindow :name="t('windows.extensionLibrary.title')" @close="Windows.close(ExtensionLibraryWindow)">
		<template #sidebar="{ hide }">
			<div class="p-4">
				<LabeledInput v-slot="{ focus, blur }" :label="t('Search Extensions')" class="bg-background-secondary !mt-1" border-color="backgroundTertiary">
					<div class="flex gap-1">
						<Icon icon="search" class="transition-colors duration-100 ease-out" />
						<input @focus="focus" @blur="blur" class="outline-none border-none bg-transparent font-theme" />
					</div>
				</LabeledInput>

				<div class="mt-4">
					<button
						v-for="tag in Object.keys(ExtensionLibraryWindow.tags)"
						class="w-full flex gap-1 p-1 mt-1 border-2 border-transparent hover:border-accent rounded transition-colors duration-100 ease-out"
						:class="{
							'bg-[var(--color)]': ExtensionLibraryWindow.selectedTag.value === tag,
						}"
						:style="{
							'--color': `var(--theme-color-${ExtensionLibraryWindow.tags[tag].color ?? 'primary'})`,
						}"
						@click="
							() => {
								ExtensionLibraryWindow.selectedTag.value = tag
								hide()
							}
						"
					>
						<Icon
							:icon="ExtensionLibraryWindow.tags[tag].icon"
							:color="ExtensionLibraryWindow.selectedTag.value === tag ? 'accent' : ExtensionLibraryWindow.tags[tag].color ?? 'primary'"
							class="text-base"
						/>
						<span class="font-theme">{{ t(tag) }}</span>
					</button>
				</div>
			</div>
		</template>
		<template #content>
			<div class="max-w-[64rem] w-[50vw] h-[38rem] flex flex-col overflow-y-auto p-4 pt-0 mr-2" :class="{ 'w-full': isMobile, 'h-full': isMobile }">
				<div
					v-for="extension in ExtensionLibraryWindow.extensions.filter(
						(extension) => ExtensionLibraryWindow.selectedTag.value === 'All' || extension.tags.includes(ExtensionLibraryWindow.selectedTag.value)
					)"
					:key="extension.id"
					class="bg-background-secondary rounded mb-4 p-2"
				>
					<div class="flex justify-between mb-4">
						<div class="flex gap-2">
							<Icon :icon="'data_object'" color="primary" />
							<h1 class="font-theme font-bold">{{ extension.name }}</h1>
						</div>

						<div class="flex gap-2 items-center">
							<IconButton icon="share" class="text-base" />

							<Button v-if="!isInstalled(extension.id)" icon="vertical_align_bottom" :text="t('Install')" @click="ExtensionLibraryWindow.requestInstall(extension)" />

							<ContextMenu v-else>
								<template #main="{ toggle }">
									<IconButton icon="more_vert" class="text-base" @click="toggle" />
								</template>

								<template #menu="{ close }">
									<div class="w-56 bg-background-secondary rounded mt-2 shadow-window overflow-hidden relative z-10 -ml-52">
										<ContextMenuItem text="Uninstall" icon="delete" @click="Extensions.uninstall(extension.id)" />
										<ContextMenuItem text="Install in Project" icon="add" v-if="isInstalledGlobal(extension.id)" />
										<ContextMenuItem text="Install Globally" icon="add" v-if="isInstalledProject(extension.id)" />
									</div>
								</template>
							</ContextMenu>
						</div>
					</div>

					<div class="mb-4 flex flex-wrap gap-4">
						<span
							class="font-theme text-sm py-1 px-2 bg-primary hover:bg-accent rounded-full flex items-center gap-1 group hover:text-background transition-colors duration-100 ease-out cursor-pointer"
						>
							<span class="material-symbols-rounded text-sm group-hover:text-background transition-colors duration-100 ease-out">person</span>

							{{ extension.author }}
						</span>

						<span class="font-theme text-sm py-1 px-2 bg-background rounded-full">
							{{ extension.version }}
						</span>

						<span
							v-for="tag in extension.tags"
							class="font-theme text-sm py-1 px-2 bg-[var(--color)] hover:bg-accent rounded-full flex items-center gap-1 group hover:text-background transition-colors duration-100 ease-out cursor-pointer"
							:style="{
								'--color': `var(--theme-color-${ExtensionLibraryWindow.tags[tag].color ?? 'primary'})`,
							}"
						>
							<span class="material-symbols-rounded text-sm group-hover:text-background transition-colors duration-100 ease-out">{{
								ExtensionLibraryWindow.tags[tag].icon
							}}</span>

							{{ tag }}
						</span>
					</div>

					<p class="font-theme text-text-secondary">{{ extension.description }}</p>
				</div>
			</div>
		</template>
	</SidebarWindow>
</template>
