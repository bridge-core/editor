<template>
	<details :open="isOpen">
		<summary
			class="rounded-lg"
			@click.prevent="$emit('toggleOpen')"
			v-ripple
		>
			<!-- Flexbox doesn't work directly on summaries in Safari -->
			<span class="d-flex" :class="{ 'justify-center': compact }">
				<h2 v-if="!compact" class="d-inline">{{ t(text) }}</h2>
				<v-spacer v-if="!compact" />
				<v-icon color="primary" large>
					{{ isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
				</v-icon>
			</span>
		</summary>

		<SidebarItem
			v-for="(
				{ text, icon, color, id, isDisabled, disabledText }, i
			) in items"
			:key="`${text}.${i}`"
			:icon="icon"
			:color="color"
			:text="text"
			:isSelected="selected === id"
			:isDisabled="isDisabled"
			:disabledText="disabledText"
			:compact="compact"
			@click="$emit('click', id)"
		/>
		<v-divider v-if="compact" />
	</details>
</template>

<script>
import SidebarItem from './Item.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

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
		compact: Boolean,
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
