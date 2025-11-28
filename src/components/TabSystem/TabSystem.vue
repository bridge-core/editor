<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ContextMenuDivider from '@/components/Common/ContextMenuDivider.vue'
import SubMenu from '@/components/Common/SubMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'

import { TabSystem } from './TabSystem'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'
import { TabManager } from './TabManager'
import { computed, ComputedRef, Ref, ref, ShallowRef, shallowRef } from 'vue'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { useTabActions } from '@/libs/actions/tab/TabActionManager'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'
import { Tab } from './Tab'

const props = defineProps({
	instance: {
		type: TabSystem,
		required: true,
	},
})

const t = useTranslate()

const get = Settings.useGet()

const tabActions = useTabActions()

const currentTabActions: ComputedRef<string[]> = computed(() => {
	const selectedTab = props.instance.selectedTab.value

	if (!selectedTab) return []

	if (!(selectedTab instanceof FileTab)) return []

	const path = selectedTab.path

	if (!ProjectManager.currentProject || !(ProjectManager.currentProject instanceof BedrockProject)) return []

	const fileType = ProjectManager.currentProject.fileTypeData.get(path)

	if (!fileType) return []

	return tabActions.value.filter((tabAction) => tabAction.fileTypes.includes(fileType.id)).map((tabAction) => tabAction.action)
})

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)
const contextMenuTab: ShallowRef<Tab | null> = shallowRef(null)
const contextMenuTabActions: Ref<string[]> = ref([])

const hoveredTab: Ref<null | Tab> = ref(null)
const hoveredSide: Ref<'right' | 'left'> = ref('right')

function getTabFromTarget(target: HTMLElement): HTMLElement | null {
	if (target.dataset.tab === 'tab') return target

	if (target.parentElement) return getTabFromTarget(target.parentElement)

	return null
}

function dragOver(event: DragEvent, tab: Tab) {
	event.preventDefault()

	if (!event.target) return

	const bounds = (getTabFromTarget(event.target as HTMLElement) ?? (event.target as HTMLElement)).getBoundingClientRect()

	const center = (bounds.left + bounds.right) / 2

	hoveredTab.value = tab
	hoveredSide.value = event.clientX >= center ? 'right' : 'left'
}

function drop(event: DragEvent) {
	hoveredTab.value = null
	dragLevel = 0
}

let dragLevel = 0

function dragEnter(event: DragEvent) {
	if (!event.target) return
	if ((event.target as HTMLElement).dataset.ignoreDrag === 'true') return

	dragLevel++

	console.log('enter', dragLevel, event.target)
}

function dragExit(event: DragEvent) {
	if (!event.target) return
	if ((event.target as HTMLElement).dataset.ignoreDrag === 'true') return

	dragLevel--

	console.log('exit', dragLevel, event.target)

	if (dragLevel === 0) hoveredTab.value = null
}

function dragEnd(event: DragEvent) {
	hoveredTab.value = null
	dragLevel = 0
}
</script>

<template>
	<div class="basis-0 min-w-0 flex-1 h-full border-background-secondary" @click="() => instance.focus()">
		<div class="flex gap-2 overflow-x-auto px-2" :class="{ 'mb-2': currentTabActions.length === 0 }">
			<div
				class="flex px-2 -mx-2"
				v-for="tab in instance.tabs.value"
				draggable="true"
				@dragover="(event) => dragOver(event, tab)"
				@drop="drop"
				@dragend="dragEnd"
				@dragenter="dragEnter"
				@dragexit="dragExit"
				data-tab="tab"
			>
				<div
					class="self-stretch rounded my-1 bg-accent duration-100 ease-out"
					:class="{
						'w-[2px] mr-[calc(0.25rem-1px)] ml-[calc(-0.25rem-1px)]': hoveredTab?.id === tab.id && hoveredSide === 'left',
						'w-0 mr-1 -ml-1': !(hoveredTab?.id === tab.id && hoveredSide === 'left'),
					}"
					data-ignore-drag="true"
				></div>

				<div
					class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-[colors, border-color] duration-100 ease-out group border-2 border-background"
					:class="{
						'max-w-[12rem]': get('compactTabDesign'),
						'bg-background-secondary':
							instance.selectedTab.value === tab && TabManager.focusedTabSystem.value?.id === instance.id,
						'bg-background-transparent hover:bg-background-secondary hover:border-background-secondary':
							instance.selectedTab.value !== tab || TabManager.focusedTabSystem.value?.id !== instance.id,
						'border-background-secondary': instance.selectedTab.value === tab,
					}"
					@click="() => instance.selectTab(tab)"
					@contextmenu.prevent.stop="
						(event) => {
							contextMenuTab = tab

							if (
								tab instanceof FileTab &&
								ProjectManager.currentProject &&
								ProjectManager.currentProject instanceof BedrockProject
							) {
								const fileType = ProjectManager.currentProject.fileTypeData.get(tab.path)

								if (fileType) {
									contextMenuTabActions = tabActions
										.filter((tabAction) => tabAction.fileTypes.includes(fileType.id))
										.map((tabAction) => tabAction.action)
								}
							}

							contextMenu?.open(event)
						}
					"
				>
					<div class="relative">
						<div
							v-if="tab instanceof FileTab && tab.modified.value"
							class="bg-behaviorPack border-2 border-[var(--border-color)] w-3 h-3 rounded-full absolute right-[-0.25rem] top-1"
							:style="{
								'--border-color':
									instance.selectedTab.value == tab
										? 'var(--theme-color-backgroundSecondary)'
										: 'var(--theme-color-background)',
							}"
						></div>

						<Icon v-if="tab.icon" :icon="tab.icon.value ?? 'help'" class="text-base text-behaviorPack" />
					</div>

					<p
						class="font-theme select-none overflow-hidden text-ellipsis whitespace-nowrap h-6 transition-colors duration-100 ease-out basis-0 grow"
						:class="{
							'text-text': instance.selectedTab.value === tab,
							'text-text-secondary group-hover:text-text': instance.selectedTab.value !== tab,
							italic: tab.temporary.value && !get('keepTabsOpen'),
						}"
					>
						{{ tab.name.value ?? 'Tab' }}
					</p>

					<IconButton icon="close" class="text-base" @click.stop="() => instance.removeTab(tab)" />
				</div>

				<div
					class="self-stretch rounded my-1 bg-accent duration-100 ease-out"
					:class="{
						'w-[2px] mr-[calc(-0.25rem-1px)] ml-[calc(0.25rem-1px)]': hoveredTab?.id === tab.id && hoveredSide === 'right',
						'w-0 -mr-1 ml-1': !(hoveredTab?.id === tab.id && hoveredSide === 'right'),
					}"
					data-ignore-drag="true"
				></div>
			</div>
		</div>

		<div
			v-if="currentTabActions.length === 1"
			@click="ActionManager.trigger(currentTabActions[0], (<FileTab>instance.selectedTab.value!).path)"
			class="flex items-center select-none cursor-pointer group mt-1 mb-2"
		>
			<Icon icon="arrow_right" class="text-primary group-hover:text-accent transition-colors duration-100 ease-in-out" />

			<p class="text-sm text-text-secondary group-hover:text-accent transition-colors duration-100 ease-in-out">
				{{ t(ActionManager.actions[currentTabActions[0]].name ?? 'actions.unknown.name') }}
			</p>
		</div>

		<ContextMenu>
			<template #main="{ toggle }">
				<div
					v-if="currentTabActions.length > 1"
					@click="toggle"
					class="flex items-center select-none cursor-pointer group mt-1 mb-2"
				>
					<Icon icon="arrow_right" class="text-primary group-hover:text-accent transition-colors duration-100 ease-in-out" />

					<p class="text-sm text-text-secondary group-hover:text-accent transition-colors duration-100 ease-in-out">
						{{ t('actions.tabActions') }}
					</p>
				</div>
			</template>

			<template #menu="{ close }">
				<div class="w-56 bg-background-secondary rounded shadow-window overflow-hidden relative z-10">
					<ActionContextMenuItem
						v-for="action in currentTabActions"
						:action="action"
						:data="() => (<FileTab>instance.selectedTab.value!).path"
						@click="close"
					/>
				</div>
			</template>
		</ContextMenu>

		<div class="w-full tab-content">
			<component
				v-if="instance.selectedTab.value"
				:instance="instance.selectedTab.value"
				:is="instance.selectedTab.value.component"
				:key="instance.selectedTab.value.id"
			/>
		</div>

		<FreeContextMenu ref="contextMenu" v-slot="{ close }">
			<ActionContextMenuItem action="tabs.close" :data="() => contextMenuTab!" @click.stop="close" />
			<ActionContextMenuItem action="tabs.closeAll" @click.stop="close" />
			<ActionContextMenuItem action="tabs.closeToRight" :data="() => contextMenuTab!" @click.stop="close" />
			<ActionContextMenuItem action="tabs.closeSaved" @click.stop="close" />
			<ActionContextMenuItem action="tabs.closeOther" :data="() => contextMenuTab!" @click.stop="close" />

			<ContextMenuDivider />

			<ActionContextMenuItem action="tabs.splitscreen" :data="() => contextMenuTab!" @click.stop="close" />
			<ActionContextMenuItem
				v-if="contextMenuTab!.temporary.value"
				action="tabs.keepOpen"
				:data="() => contextMenuTab!"
				@click.stop="close"
			/>

			<ContextMenuDivider v-if="contextMenuTabActions.length > 0" />

			<SubMenu v-if="contextMenuTabActions.length > 0">
				<template #main="slotProps">
					<ContextMenuItem icon="more_horiz" text="actions.more" @mouseenter="slotProps.show" @mouseleave="slotProps.hide" />
				</template>

				<template #menu="">
					<ActionContextMenuItem
						v-for="action in contextMenuTabActions"
						:action="action"
						@click="
							() => {
								ActionManager.trigger(action, (<FileTab>instance.selectedTab.value!).path)

								close()
							}
						"
					/>
				</template>
			</SubMenu>
		</FreeContextMenu>
	</div>
</template>

<style scoped>
.tab-content {
	height: calc(100% - 2.5rem - 0.5rem);
}
</style>
