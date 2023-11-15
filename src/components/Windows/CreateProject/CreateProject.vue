<template>
	<Window name="Create Project">
		<div class="p-8">
			<div class="flex gap-3 mb-2">
				<div
					class="w-32 h-32 bg-menu rounded p-2 transition-colors duration-100 ease-out"
					:class="{ 'border-2 border-primary': i == 0 }"
					v-for="(pack, i) in packTypes"
				>
					<p>{{ pack }}</p>
				</div>
			</div>

			<div class="flex gap-4 w-full">
				<LabeledInput
					label="Icon"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>

				<LabeledInput
					label="Name"
					class="mb-4 flex-1"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none max-w-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>
			</div>

			<LabeledInput
				label="Description"
				class="mb-4"
				v-slot="{ focus, blur }"
			>
				<input
					class="bg-background outline-none max-w-none"
					value="Test"
					@focus="focus"
					@blur="blur"
				/>
			</LabeledInput>

			<div class="flex gap-4">
				<LabeledInput
					label="Namespace"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>

				<LabeledInput
					label="Author"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>

				<LabeledInput
					label="Target Version"
					class="mb-4"
					v-slot="{ focus, blur }"
				>
					<input
						class="bg-background outline-none"
						value="Test"
						@focus="focus"
						@blur="blur"
					/>
				</LabeledInput>
			</div>

			<Button text="Create" @click="create" />
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '/@/components/Windows/Window.vue'
import Button from '/@/components/Common/Button.vue'
import LabeledInput from '/@/components/Common/LabeledInput.vue'

import { App } from '/@/App'
import { join } from '/@/libs/path'
import { createBridgePack } from './Packs/Bridge'
import { createBehaviourPack } from './Packs/BehaviourPack'
import { ref } from 'vue'

const packTypes = ref(['Behaviour Pack', 'Resource Pack'])

async function create() {
	const fileSystem = App.instance.fileSystem

	const projectPath = join('projects', 'test')

	await fileSystem.makeDirectory(projectPath)

	await createBridgePack(fileSystem, projectPath)
}
</script>
