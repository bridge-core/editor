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
import { Toolbar } from './Toolbar'
import { ChangelogWindow } from '@/components/Windows/Changelog/ChangelogWindow'
import { ActionManager } from '@/libs/actions/ActionManager'
import { useIsMobile } from '@/libs/Mobile'

const t = useTranslate()

function openChangelog() {
	Windows.open(ChangelogWindow)
}

const isMobile = useIsMobile()
</script>

<template>
	<div data-tauri-drag-region class="bg-toolbar h-toolbar flex justify-between items-center px-2">
		<div class="flex gap-4">
			<span v-for="item in Toolbar.items">
				<button v-if="item.type === 'button'" class="flex items-center gap-1 group" @click="item.action">
					<span
						class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-theme select-none"
						>{{ t(item.name) }}</span
					>
				</button>

				<ContextMenu v-if="item.type === 'dropdown'">
					<template #main="{ toggle }">
						<button class="flex items-center gap-1 group" @click="toggle">
							<span
								class="text-sm group-hover:text-primary transition-colors duration-100 ease-out font-theme select-none"
								>{{ t(item.name) }}</span
							>
						</button>
					</template>

					<template #menu="{ close }">
						<div class="bg-background-secondary rounded mt-2 shadow-window overflow-hidden relative z-10">
							<span v-for="dropdownItem in item.items">
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

								<div
									v-if="dropdownItem.type === 'seperator'"
									class="bg-background-tertiary w-full h-[2px] my-1"
								></div>
							</span>
						</div>
					</template>
				</ContextMenu>
			</span>
		</div>

		<div class="flex gap-4 items-center">
			<div class="flex gap-2 items-center hover:cursor-pointer" @click="openChangelog">
				<Logo class="w-4" />

				<span
					v-if="!isMobile"
					class="text-sm text-text-secondary font-theme transition ease-out hover:text-accent duration-100"
				>
					v{{ appVersion }}
				</span>
			</div>

			<div v-if="tauriBuild" class="flex gap-2 items-center">
				<IconButton @click="appWindow.minimize()" icon="remove" class="text-base" />
				<IconButton @click="appWindow.toggleMaximize()" icon="select_window" class="text-base" />
				<IconButton @click="appWindow.close()" icon="close" class="text-base" />
			</div>
		</div>
	</div>
</template>
