<template>
	<BaseWindow v-bind="$attrs" v-on="$listeners">
		<template #toolbar>
			<slot name="toolbar" v-bind:selectedTab="selected" />
		</template>

		<template #sidebar>
			<slot name="sidebar" v-bind:selectedSidebar="selected" />

			<template
				v-for="({ id, text, icon, color, items, isOpen },
				i) in sidebarItems"
			>
				<SidebarItem
					v-if="!items || items.length === 0"
					:key="`${text}.${i}`"
					:icon="icon"
					:color="color"
					:text="text"
					:isSelected="selected === id"
					@click="onSidebarChanged(id)"
				/>
				<SidebarGroup
					v-else
					:key="`${text}.${i}`"
					:isOpen="isOpen"
					:items="items"
					:text="text"
					:selected="selected"
					@toggleOpen="toggleOpenCategory(i)"
					@click="onSidebarChanged"
				/>
			</template>
		</template>

		<template #default>
			<slot name="default" v-bind:selectedSidebar="selected" />
		</template>

		<template #actions>
			<slot name="actions" v-bind:selectedSidebar="selected" />
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from './BaseWindow.vue'
import SidebarItem from './Sidebar/Item.vue'
import SidebarGroup from './Sidebar/Group.vue'

export default {
	inheritAttrs: false,
	components: {
		BaseWindow,
		SidebarItem,
		SidebarGroup,
	},
	props: {
		sidebarItems: Array,
		selectedValue: {
			type: String,
			default: undefined,
		},
	},
	data() {
		return {
			selected: this.selectedValue,
		}
	},
	methods: {
		onSidebarChanged(id) {
			this.$emit('sidebarChanged', id)
			this.selected = id
		},
		toggleOpenCategory(index) {
			this.sidebarItems[index].isOpen = !this.sidebarItems[index].isOpen
		},
	},
}
</script>
