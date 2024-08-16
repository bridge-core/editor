<script setup lang="ts">
defineProps<{ parent: HTMLElement | null; items: { id: any; label: string }[] }>()

const emit = defineEmits<{ selected: [item: { id: any; label: string }] }>()

const [expanded, expandedModifiers] = defineModel<boolean>()
</script>

<template>
	<div class="absolute z-10" :style="{ width: `${parent?.clientWidth ?? 100}px` }">
		<div v-if="expanded">
			<div class="mt-2 bg-background-secondary w-full rounded">
				<div class="flex p-1 flex-col max-h-[8rem] overflow-y-auto light-scroll">
					<button
						v-for="item in items"
						@click="
							() => {
								emit('selected', item)

								expanded = false
							}
						"
						class="hover:bg-background-tertiary text-start p-1 rounded transition-colors duration-100 ease-out font-inter text-sm"
					>
						{{ item.label }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
