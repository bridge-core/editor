<template>
	<div class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div></div>
		<div class="flex gap-2" @click="openChangelog">
			<Logo class="w-4" />
			<span class="text-sm"> v{{ version }} </span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { App } from '/@/App'
import Logo from '/@/components/Common/Logo.vue'

import { version } from '/@/libs/app/version'

function openChangelog() {
	App.instance.windows.openWindows.value.push('Changelog')
}
</script>
