<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { useTranslate } from '@/libs/locales/Locales'
import { Settings } from '@/libs/settings/Settings'

const t = useTranslate()
const get = Settings.useGet()

function toggle(id: string) {
	const hiddenElements = Settings.get('hiddenSidebarElements') as string[]

	if (!hiddenElements.includes(id)) {
		hiddenElements.push(id)
	} else {
		hiddenElements.splice(hiddenElements.indexOf(id), 1)
	}

	Settings.set('hiddenSidebarElements', hiddenElements)
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<button
			v-for="item in Sidebar.items.filter((item) => item.type !== 'divider')"
			class="flex w-full bg-background-secondary p-2 rounded gap-2 font-inter border-2 border-background-secondary transition-border transition-colors duration-100 ease-out"
			:class="{
				'border-primary': !get('hiddenSidebarElements').includes(item.id),
				'hover:border-accent': get('hiddenSidebarElements').includes(item.id),
			}"
			@click="toggle(item.id)"
		>
			<Icon :icon="item.icon" :color="!get('hiddenSidebarElements').includes(item.id) ? 'primary' : 'text'" class="transition-colors duration-100 ease-out" />

			<p>{{ t(item.label) }}</p>
		</button>
	</div>
</template>
