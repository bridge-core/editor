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
	>
		<ContextMenuList @click="isVisible = false" :actions="actions" />
	</v-menu>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { createSimpleTransition } from 'vuetify/lib/components/transitions/createTransition'
import Vue from 'vue'
import ContextMenuList from './List.vue'
const contextMenuTransition = createSimpleTransition('context-menu-transition')

Vue.component('context-menu-transition', contextMenuTransition)

export default {
	components: { ContextMenuList },
	name: 'ContextMenu',
	mixins: [TranslationMixin],
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
				this.contextMenu.isVisible = val
			},
			get() {
				return this.contextMenu.isVisible
			},
		},
		actions() {
			if (!this.contextMenu || !this.contextMenu.actionManager) return {}
			return this.contextMenu.actionManager.state
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
