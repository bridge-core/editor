<template>
	<v-menu
		v-model="isVisible"
		ref="menu"
		:position-x="x"
		:position-y="y"
		rounded="lg"
		absolute
		offset-y
		transition="context-menu-transition"
		:offset-overflow="false"
		:close-on-click="contextMenu.mayCloseOnClickOutside"
		:close-on-content-click="false"
		min-width="200px"
		max-width="500px"
	>
		<v-card color="menu">
			<v-card-title v-if="contextMenu.card.title">
				{{ contextMenu.card.title }}
			</v-card-title>
			<v-card-text v-if="contextMenu.card.text">
				{{ contextMenu.card.text }}
			</v-card-text>
			<v-divider v-if="contextMenu.card.text || contextMenu.card.title" />
			<ContextMenuList @click="isVisible = false" :actions="actions" />
		</v-card>
	</v-menu>
</template>

<script>
import { createSimpleTransition } from 'vuetify/lib/components/transitions/createTransition'
import Vue from 'vue'
import ContextMenuList from './List.vue'
const contextMenuTransition = createSimpleTransition('context-menu-transition')

Vue.component('context-menu-transition', contextMenuTransition)

export default {
	components: { ContextMenuList },
	name: 'ContextMenu',
	props: {
		contextMenu: Object,
		windowHeight: Number,
	},
	data: () => ({
		shouldRender: false,
		timeoutId: null,
	}),
	computed: {
		x() {
			return this.contextMenu.position.x
		},
		y() {
			const lowestY =
				this.contextMenu.position.y + this.contextMenu.menuHeight
			if (lowestY > this.windowHeight) {
				const offset = this.windowHeight - lowestY

				return this.contextMenu.position.y - offset
			}
			return this.contextMenu.position.y
		},
		isVisible: {
			set(val) {
				this.contextMenu.isVisible.value = val
			},
			get() {
				return this.contextMenu.isVisible.value
			},
		},
		actions() {
			if (!this.contextMenu || !this.contextMenu.actionManager.value)
				return {}
			return this.contextMenu.actionManager.value.state
		},
	},
	watch: {
		isVisible() {
			if (!this.isVisible) {
				this.timeoutId = setTimeout(() => {
					this.shouldRender = false
					this.timeoutId = null
				}, 500)
			} else {
				this.shouldRender = true
				if (this.timeoutId) clearTimeout(this.timeoutId)
			}
		},
	},
}
</script>

<style>
.context-menu-transition-enter-active,
.context-menu-transition-leave-active {
	transition: opacity 0.08s;
}
.context-menu-transition-enter,
.context-menu-transition-leave-to {
	opacity: 0;
}
</style>
