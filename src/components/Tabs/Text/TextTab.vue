<script setup lang="ts">
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ContextMenuDivider from '@/components/Common/ContextMenuDivider.vue'

import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { type TextTab } from './TextTab'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'

const { instance }: { instance: TextTab } = <any>defineProps({
	instance: {
		required: true,
	},
})

const tabElement: Ref<HTMLDivElement | null> = ref(null)
const editorContainer: Ref<HTMLDivElement | null> = ref(null)
const editorElement: Ref<HTMLDivElement | null> = ref(null)

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

const resizeObserver = new ResizeObserver(() => {
	if (!tabElement.value) return
	if (!editorContainer.value) return

	editorContainer.value.style.width = tabElement.value.getBoundingClientRect().width + 'px'

	editorContainer.value.style.height = tabElement.value.getBoundingClientRect().height + 'px'
})

let mountedElement: null | HTMLDivElement = null

onMounted(async () => {
	if (!tabElement.value) return
	if (!editorContainer.value) return
	if (!editorElement.value) return

	resizeObserver.observe(tabElement.value)

	mountedElement = editorElement.value

	await instance.mountEditor(editorElement.value)
})

onUnmounted(() => {
	if (!mountedElement) return

	instance.unmountEditor(mountedElement)
})
</script>

<template>
	<div class="w-full h-full" ref="tabElement">
		<div class="absolute" ref="editorContainer">
			<div class="h-full" ref="editorElement" @contextmenu.prevent="contextMenu?.open" />
		</div>

		<FreeContextMenu class="w-56" ref="contextMenu" v-slot="{ close }">
			<ActionContextMenuItem action="textEditor.copy" @click="close" />
			<ActionContextMenuItem action="textEditor.cut" @click="close" />
			<ActionContextMenuItem action="textEditor.paste" @click="close" />

			<ContextMenuDivider />

			<ActionContextMenuItem action="textEditor.save" @click="close" />

			<ContextMenuDivider />

			<ActionContextMenuItem action="textEditor.viewDocumentation" @click="close" />
			<ActionContextMenuItem action="textEditor.format" @click="close" />
			<ActionContextMenuItem action="textEditor.changeAllOccurrences" @click="close" />
			<ActionContextMenuItem action="textEditor.goToDefinition" @click="close" />
			<ActionContextMenuItem action="textEditor.goToSymbol" @click="close" />
		</FreeContextMenu>
	</div>
</template>
