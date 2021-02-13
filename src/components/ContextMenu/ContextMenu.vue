<template>
	<v-menu
		v-if="shouldRender"
		v-model="isVisible"
		:position-x="contextMenu.position.x"
		:position-y="contextMenu.position.y"
		absolute
		offset-y
	>
		<v-list>
			<v-list-item
				v-for="action in contextMenu.actionManager.state"
				:key="action.id"
				rounded="lg"
				origin="center center"
				transition="scale-transition"
				@click="action.trigger()"
			>
				<v-icon color="primary">{{ action.icon }}</v-icon>
				<v-list-item-title>{{ t(action.name) }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
export default {
	name: 'ContextMenu',
	mixins: [TranslationMixin],
	props: {
		contextMenu: Object,
	},
	data: () => ({
		shouldRender: false,
		timeoutId: 0,
	}),
	computed: {
		isVisible: {
			set(val) {
				this.contextMenu.isVisible = val
			},
			get() {
				return this.contextMenu.isVisible
			},
		},
	},
	watch: {
		isVisible() {
			if (!this.isVisible) {
				this.timeoutId = setTimeout(
					() => (this.shouldRender = false),
					500
				)
			} else {
				this.shouldRender = true
				clearTimeout(this.timeoutId)
			}
		},
	},
}
</script>
