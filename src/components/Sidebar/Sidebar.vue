<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import Notification from '@/components/Notifications/Notification.vue'

import { Sidebar } from '@/components/Sidebar/Sidebar'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
</script>

<template>
	<div class="w-16 h-full bg-background-secondary rounded mt-2 flex flex-col gap-2 items-center p-3 overflow-y-auto">
		<div v-for="item in Sidebar.items">
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
	</div>
</template>
