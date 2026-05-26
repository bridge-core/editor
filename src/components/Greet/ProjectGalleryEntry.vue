<script lang="ts" setup>
import IconButton from '@/components/Common/IconButton.vue'

const emit = defineEmits(['favorite', 'edit'])

defineProps({
	name: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		required: true,
	},
	favorite: {
		type: Boolean,
		required: true,
	},
	readOnly: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<div
		class="project-gallery-entry flex flex-col bg-background-secondary rounded relative w-36 h-36 cursor-pointer border-transparent border-2 group hover:border-accent transition-colors duration-100 ease-out"
	>
		<div class="w-full rounded overflow-hidden aspect-video">
			<img
				:src="icon"
				class="w-full object-cover group-hover:scale-110 transition-transform duration-100 ease-out -translate-y-1/4 pixelated"
			/>
		</div>

		<p class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5 font-theme font-medium">
			{{ name }}
		</p>

		<IconButton v-if="!readOnly" icon="edit" class="edit-button absolute right-7 top-0.5 drop-icon" @click.stop="emit('edit', name)" />

		<IconButton
			v-if="!readOnly"
			icon="star"
			class="star-button absolute right-0.5 top-0.5 drop-icon"
			:class="{
				favorite: favorite,
				'text-warning': favorite,
				'text-text': !favorite,
			}"
			@click.stop="emit('favorite', name)"
		/>
	</div>
</template>

<style>
.drop-icon {
	filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 1));
}

.pixelated {
	image-rendering: pixelated;
}

.edit-button {
	opacity: 0;

	transition: opacity 100ms ease-out;
}

.star-button {
	opacity: 0;

	transition: opacity 100ms ease-out;
}

.star-button.favorite {
	opacity: 1;
}

.project-gallery-entry:hover > .edit-button {
	opacity: 1;

	transition: none;
}

.project-gallery-entry:hover > .star-button {
	opacity: 1;

	transition: none;
}
</style>
