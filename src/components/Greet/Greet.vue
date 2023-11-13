<template>
	<main class="w-full h-full flex justify-center items-center">
		<div class="flex flex-col">
			<div class="flex justify-between">
				<p class="mb-1 text-lg text-text">Projects</p>
			</div>

			<div class="h-px w-full bg-menu mb-1" />

			<div class="project-list"></div>

			<div class="flex items-center flex-col mt-8">
				<p class="opacity-30 text-text">
					You need to select a bridge. folder.
				</p>
				<p class="text-primary cursor-pointer hover:underline">
					{{ 'windows.settings.general.selectBridgeFolder.name' }}
				</p>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts"></script>

<style scoped></style>
