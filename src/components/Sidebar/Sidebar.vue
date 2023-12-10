<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import { sidebar } from '@/App'
</script>

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
		<div v-for="item in sidebar.notifications.value" :key="item.id">
			<div
				class="w-10 h-10 rounded flex justify-center items-center bg-[var(--color)] hover:bg-[var(--hover-color)] transition-colors duration-100 ease-out cursor-pointer group"
				:style="{
					'--color': item.color
						? `var(--theme-color-${item.color})`
						: 'var(--theme-color-background)',
					'--hover-color': item.color
						? `var(--theme-color-text)`
						: 'var(--theme-color-primary)',
				}"
				@click="() => sidebar.activateNotification(item)"
			>
				<Icon
					:icon="item.icon!"
					:color="undefined"
					class="group-hover:text-[var(--hover-color)] text-text transition-colors duration-100 ease-out"
					:style="{
						'--hover-color': item.color
							? `var(--theme-color-background)`
							: 'var(--theme-color-text)',
					}"
				/>
			</div>
		</div>
	</div>
</template>
