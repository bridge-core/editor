<template>
	<BaseWindow v-bind="$attrs" v-on="$listeners">
		<template #toolbar>
			<slot name="toolbar" v-bind:selectedTab="currentSidebar" />
		</template>

		<template #sidebar>
			<SidebarItem
				v-for="({ text, icon, color }, i) in sidebarItems"
				:key="`${text}.${i}`"
				:icon="icon"
				:color="color"
				:text="text"
				:isSelected="selected === i"
				@click="onSidebarChanged(i)"
			/>
		</template>

		<template #default>
			<slot name="default" v-bind:selectedSidebar="currentSidebar" />
		</template>

		<template #actions>
			<slot name="actions" v-bind:selectedSidebar="currentSidebar" />
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from './BaseWindow.vue'
import SidebarItem from './Sidebar/Item.vue'

export default {
	inheritAttrs: false,
	components: {
		BaseWindow,
		SidebarItem,
	},
	props: {
		sidebarItems: Array,
		selectedValue: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			selected: this.selectedValue || 0,
		}
	},
	computed: {
		currentSidebar() {
			if (this.sidebarItems[this.selected])
				return this.sidebarItems[this.selected].id
			return undefined
		},
	},
	methods: {
		onSidebarChanged(index) {
			this.$emit('sidebarChanged', index)
			this.selected = index
		},
	},
}
</script>
