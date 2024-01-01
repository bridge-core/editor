<script setup lang="ts">
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import Icon from '@/components/Common/Icon.vue'

import { tabManager } from '@/App'
import { basename } from '@/libs/path'
import { ref, Ref } from 'vue'

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function click() {
	tabManager.openFile(path)
}

const { path } = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})
</script>

<template>
	<div
		class="flex items-center gap-2"
		@click="click"
		@contextmenu.prevent="contextMenu?.open"
	>
		<Icon icon="draft" :color="color" class="text-sm" />

		<span class="select-none font-inter"> {{ basename(path) }} </span>

		<FreeContextMenu ref="contextMenu">
			<ContextMenuItem icon="help" text="test" />
		</FreeContextMenu>
	</div>
</template>
