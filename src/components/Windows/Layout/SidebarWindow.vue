<template>
	<BaseWindow v-bind="$attrs" :isLoading="isLoading" v-on="$listeners">
		<template #toolbar>
			<slot name="toolbar" v-bind:selectedTab="selected" />
		</template>

		<template #sidebar>
			<template v-if="!isLoading">
				<slot
					name="sidebar"
					v-if="!isMobile"
					v-bind:selectedSidebar="selected"
				/>

				<template v-for="element in sidebarItems">
					<SidebarItem
						v-if="element.type === 'item'"
						:key="`${element.id}`"
						:icon="element.icon"
						:color="element.color"
						:text="element.text"
						:isSelected="selected === element.id"
						:isDisabled="element.isDisabled"
						:disabledText="element.disabledText"
						:compact="isMobile"
						@click="onSidebarChanged(element.id)"
					/>

					<SidebarGroup
						v-else
						:key="`${element.id}.${element.isOpen}`"
						:isOpen="element.isOpen"
						:items="element.getItems()"
						:text="element.text"
						:selected="selected"
						:compact="isMobile"
						@toggleOpen="toggleOpenCategory(element)"
						@click="onSidebarChanged"
					/>
				</template>
			</template>
			<v-progress-linear indeterminate v-else />
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
		isLoading: Boolean,
		value: {
			type: String,
			default: undefined,
		},
	},
	computed: {
		selected() {
			return this.value
		},
		isMobile() {
			return this.$vuetify.breakpoint.mobile
		},
	},
	methods: {
		onSidebarChanged(id) {
			this.$emit('input', id)
		},
		toggleOpenCategory(element) {
			element.isOpen = !element.isOpen
		},
	},
}
</script>
