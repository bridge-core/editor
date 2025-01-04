<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import Notification from '@/components/Notifications/Notification.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'

import { Sidebar } from '@/components/Sidebar/Sidebar'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { Ref, ref } from 'vue'
import { ActionManager } from '@/libs/actions/ActionManager'
import { Settings } from '@/libs/settings/Settings'

const get = Settings.useGet()

const contextMenu: Ref<typeof FreeContextMenu | null> = ref(null)

function executeContextMenuAction(action: string, data: any) {
	if (!contextMenu.value) return

	ActionManager.trigger(action, data)

	contextMenu.value.close()
}
</script>

<template>
	<div class="min-w-[3.5rem] h-full bg-background-secondary rounded mt-2 flex flex-col gap-2 items-center p-2 overflow-y-auto" @contextmenu.prevent.stop="contextMenu?.open">
		<div v-for="item in Sidebar.items.filter((item) => item.type !== 'button' || !get('hiddenSidebarElements').includes(item.id))">
			<div
				class="w-10 h-10 bg-background rounded flex justify-center items-center hover:bg-primary transition-colors duration-100 ease-out cursor-pointer"
				v-if="item.type === 'button'"
				@click="item.callback"
			>
				<Icon :icon="item.icon!" />
			</div>

			<div class="w-10 border border-background-tertiary my-2" v-if="item.type === 'divider'" />
		</div>

		<Notification
			v-for="item in NotificationSystem.notifications.value"
			:key="item.id"
			@click="() => NotificationSystem.activateNotification(item)"
			:icon="item.icon"
			:type="item.type"
			:progress="item.progress"
			:max-progress="item.progress"
			:color="item.color"
			:color-hover="item.color ? 'accent' : undefined"
			icon-color="accent"
			:icon-color-hover="item.color ? 'accentSecondary' : undefined"
		/>

		<FreeContextMenu ref="contextMenu">
			<ContextMenuItem icon="delete_forever" text="Clear Notifications" @click.stop="executeContextMenuAction('clearNotifications', null)"> </ContextMenuItem>
		</FreeContextMenu>
	</div>
</template>
