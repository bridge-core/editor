<template>
	<details :key="text + isOpen" :open="isOpen">
		<summary
			class="d-flex rounded-lg"
			@click.prevent="$emit('toggleOpen')"
			v-ripple
		>
			<h2 class="d-inline">{{ t(text) }}</h2>
			<v-spacer />
			<v-icon color="primary">
				{{ isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
			</v-icon>
		</summary>

		<SidebarItem
			v-for="({ text, icon, color, id }, i) in items"
			:key="`${text}.${i}`"
			:icon="icon"
			:color="color"
			:text="text"
			:isSelected="selected === id"
			@click="$emit('click', id)"
		/>
	</details>
</template>

<script>
import SidebarItem from './Item.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'SidebarGroup',
	mixins: [TranslationMixin],
	components: {
		SidebarItem,
	},
	props: {
		text: String,
		isOpen: Boolean,
		items: Array,
		selected: String,
	},
}
</script>

<style scoped>
summary {
	outline: none;
	cursor: pointer;
	display: block;
}
</style>
