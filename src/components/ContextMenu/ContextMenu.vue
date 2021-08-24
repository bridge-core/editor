<template>
	<v-menu
		v-if="isVisible"
		v-model="isVisible"
		:position-x="contextMenu.position.x"
		:position-y="contextMenu.position.y"
		rounded="lg"
		absolute
		offset-y
		:close-on-click="contextMenu.mayCloseOnClickOutside"
	>
		<v-list color="menu" dense>
			<template v-for="(action, id) in contextMenu.actionManager.state">
				<v-divider v-if="action.type === 'divider'" :key="id" />
				<v-list-item
					v-else
					:key="id"
					origin="center center"
					transition="scale-transition"
					:disabled="action.isDisabled"
					@click="action.trigger()"
				>
					<v-list-item-icon
						:style="{ opacity: action.isDisabled ? '38%' : null }"
						class="mr-2"
					>
						<v-icon color="primary">{{ action.icon }}</v-icon>
					</v-list-item-icon>
					<v-list-item-action class="ma-0">
						{{ t(action.name) }}
					</v-list-item-action>
				</v-list-item>
			</template>
		</v-list>
	</v-menu>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	name: 'ContextMenu',
	mixins: [TranslationMixin],
	props: {
		contextMenu: Object,
	},
	data: () => ({
		shouldRender: false,
		timeoutId: null,
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
