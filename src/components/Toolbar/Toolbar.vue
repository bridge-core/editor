<template>
	<div class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div class="flex gap-4">
			<button
				v-for="item in instance.items"
				class="flex items-center gap-1 group"
				@click="item.action"
			>
				<!-- <Icon :icon="item.icon" class="text-xs" /> -->
				<span
					class="text-sm group-hover:text-primary transition-colors duration-100 ease-out"
					>{{ item.name }}</span
				>
			</button>
		</div>
		<div class="flex gap-2" @click="openChangelog">
			<Logo class="w-4" />
			<span class="text-sm text-textAlternate"> v{{ version }} </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import Logo from '/@/components/Common/Logo.vue'
import Icon from '/@/components/Common/Icon.vue'

import { App } from '/@/App'
import { version } from '/@/libs/app/version'

const instance = App.instance.toolbar

function openChangelog() {
	App.instance.windows.openWindows.value.push('changelog')
}
</script>
