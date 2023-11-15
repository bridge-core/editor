<template>
	<Window name="Create Project">
		<div class="p-8">
			<Button text="Create" @click="create" />
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '/@/components/Windows/Window.vue'
import Button from '/@/components/Common/Button.vue'

import { App } from '/@/App'
import pathBrowserify from 'path-browserify'
import { createBridgePack } from './Packs/Bridge'
import { createBehaviourPack } from './Packs/BehaviourPack'

async function create() {
	const fileSystem = App.instance.fileSystem

	const projectPath = pathBrowserify.join('projects', 'test')

	await fileSystem.makeDirectory(projectPath)

	await createBridgePack(fileSystem, projectPath)
	await createBehaviourPack(fileSystem, projectPath)
}
</script>
