<script setup lang="ts">
import Logo from '@/components/Common/Logo.vue'
import IconButton from '@/components/Common/IconButton.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'

import { Windows } from '@/components/Windows/Windows'
import { appVersion } from '@/libs/app/AppEnv'
import { useTranslate } from '@/libs/locales/Locales'
import { appWindow } from '@tauri-apps/api/window'
import { tauriBuild } from '@/libs/tauri/Tauri'
import { DropdownItem, Toolbar, ToolbarItem } from './Toolbar'
import { ChangelogWindow } from '@/components/Windows/Changelog/ChangelogWindow'
import { ActionManager, useAction } from '@/libs/actions/ActionManager'
import { useIsMobile } from '@/libs/Mobile'
import { onMounted, Ref, ref, watch } from 'vue'

const t = useTranslate()

function openChangelog() {
	Windows.open(ChangelogWindow)
}

const isMobile = useIsMobile()

const renderableToolbarItems: Ref<ToolbarItem[]> = ref([])

onMounted(() => {
	renderableToolbarItems.value = Toolbar.items.value.filter((item) => shouldRenderItem(item))

	ActionManager.actionsUpdated.on(() => {
		renderableToolbarItems.value = Toolbar.items.value.filter((item) => shouldRenderItem(item))
	})
})

watch(Toolbar.items, () => {
	renderableToolbarItems.value = Toolbar.items.value.filter((item) => shouldRenderItem(item))
})

function shouldRenderItem(item: ToolbarItem): boolean {
	if (item.type === 'button') return ActionManager.actions[item.action]?.visible ?? false
	if (item.type === 'dropdown') {
		return item.items.some((item) => item.type === 'button' && (ActionManager.actions[item.action]?.visible ?? false))
	}

	return true
}

function cleanupDropdownItems(items: DropdownItem[]): DropdownItem[] {
	let cleanedItems: DropdownItem[] = []

	for (const item of items) {
		if (item.type === 'seperator' && cleanedItems.length === 0) continue
		if (item.type === 'seperator' && cleanedItems[cleanedItems.length - 1].type === 'seperator') continue
		if (item.type === 'button' && !ActionManager.actions[item.action]?.visible) continue

		cleanedItems.push(item)
	}

	if (cleanedItems.length > 0 && cleanedItems[cleanedItems.length - 1].type === 'seperator') cleanedItems.pop()

	return cleanedItems
}
</script>

<template>
	<div data-tauri-drag-region class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div class="flex gap-4">
			<span v-for="item in renderableToolbarItems">
				<button v-if="item.type === 'button'" class="flex items-center gap-1 group" @click="ActionManager.trigger(item.action)">
					<span class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-theme select-none">{{
						t(ActionManager.actions[item.action]?.name ?? 'actions.unknown.name')
					}}</span>
				</button>

				<ContextMenu v-if="item.type === 'dropdown'">
					<template #main="{ toggle }">
						<button class="flex items-center gap-1 group" @click="toggle">
							<span class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-theme select-none">{{ t(item.name) }}</span>
						</button>
					</template>

					<template #menu="{ close }">
						<div class="bg-background-secondary rounded mt-2 shadow-window overflow-hidden relative z-10">
							<span v-for="dropdownItem in cleanupDropdownItems(item.items)">
								<ActionContextMenuItem
									v-if="dropdownItem.type === 'button'"
									:action="dropdownItem.action"
									@click="
										() => {
											ActionManager.trigger(dropdownItem.action, undefined)
											close()
										}
									"
								/>

								<div v-if="dropdownItem.type === 'seperator'" class="bg-background-tertiary w-full h-[2px] my-1"></div>
							</span>
						</div>
					</template>
				</ContextMenu>
			</span>
		</div>

		<div class="flex gap-4 items-center">
			<div class="flex gap-2 items-center hover:cursor-pointer" @click="openChangelog">
				<Logo class="w-4" />

				<span v-if="!isMobile" class="text-sm text-text-secondary font-theme transition ease-out hover:text-accent duration-100"> v{{ appVersion }} </span>
			</div>

			<div v-if="tauriBuild" class="flex gap-2 items-center">
				<IconButton @click="appWindow.minimize()" icon="remove" class="text-base" />
				<IconButton @click="appWindow.toggleMaximize()" icon="select_window" class="text-base" />
				<IconButton @click="appWindow.close()" icon="close" class="text-base" />
			</div>
		</div>
	</div>
</template>
