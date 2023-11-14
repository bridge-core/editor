<template>
	<main class="w-full h-full flex justify-center items-center">
		<div class="flex flex-col">
			<Logo class="ml-auto mr-auto mb-24 -mt-24 w-48" />

			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text">Projects</p>

				<div>
					<span class="material-symbols-rounded text-text mr-1">
						folder
					</span>
					<span class="material-symbols-rounded text-text">
						add
					</span>
				</div>
			</div>

			<div class="h-px w-full bg-menu mb-1" />

			<div class="project-list"></div>

			<div class="flex items-center flex-col mt-8">
				<p class="opacity-30 text-text">
					You need to select a bridge. folder.
				</p>
				<p class="text-primary cursor-pointer hover:underline">
					{{ 'Select a bridge. folder' }}
				</p>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import Logo from '/@/components/Common/Logo.vue'
</script>
