<template>
	<div
		class="self-stretch w-16 bg-menuAlternate rounded my-2 flex flex-col gap-2 items-center p-3"
	>
		<div v-for="item in sidebar.items">
			<div
				class="w-10 h-10 bg-background rounded flex justify-center items-center hover:bg-primary transition-colors duration-100 ease-out cursor-pointer"
				v-if="item.type === 'button'"
				@click="item.callback"
			>
				<Icon :icon="item.icon!" />
			</div>
			<div
				class="w-10 border border-menu my-2"
				v-if="item.type === 'divider'"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import { sidebar } from '@/App'
</script>
