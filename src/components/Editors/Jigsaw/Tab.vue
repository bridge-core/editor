<template>
	<div
		class="editor-container px-3 pb-3"
		:style="{
			fontSize,
			fontFamily: codeFontFamily,
			height: `${height - 12}px`,
		}"
		ref="editorContainer"
		@click="tab.parent.setActive(true)"
		tabindex="-1"
	>
		<div
			class="grid-container outlined rounded-lg"
			:style="{ cursor: cursorStyle }"
			@mousedown="onMouseDown"
			@mousemove="onMouseMove"
			@mouseup="onMouseUp"
		>
			<div
				:style="{
					top: `${(this.currentY % 42) - 42}px`,
					left: `${(this.currentX % 42) - 42}px`,
				}"
				class="grid"
			></div>
		</div>
	</div>
</template>

<script>
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'TreeTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
		height: Number,
	},
	data: () => ({
		cursorStyle: 'grab',
		startPosData: null,
	}),
	mounted() {
		// this.treeEditor.receiveContainer(this.$refs.editorContainer)
	},
	activated() {
		// this.treeEditor.receiveContainer(this.$refs.editorContainer)
	},
	methods: {
		onMouseDown(event) {
			this.startPosData = {
				containerX: this.currentX,
				containerY: this.currentY,
				x: event.clientX,
				y: event.clientY,
			}
			this.cursorStyle = 'grabbing'
		},
		onMouseMove(event) {
			if (!this.startPosData) return

			const { x, y, containerX, containerY } = this.startPosData

			const dx = event.clientX - x
			const dy = event.clientY - y
			this.currentX = containerX + dx
			this.currentY = containerY + dy
		},
		onMouseUp(event) {
			this.startPosData = null
			this.cursorStyle = 'grab'
		},
	},
	computed: {
		fontSize() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFontSize
				? `${settingsState.appearance.editorFontSize}`
				: '14px'
		},
		codeFontFamily() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFont
				? `${settingsState.appearance.editorFont} !important`
				: 'Menlo !important'
		},
		fontFamily() {
			return this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.font
				? `${this.settingsState.appearance.font} !important`
				: 'Roboto !important'
		},
		currentX: {
			get() {
				return this.tab.position.x
			},
			set(val) {
				this.tab.position.x = val
			},
		},
		currentY: {
			get() {
				return this.tab.position.y
			},
			set(val) {
				this.tab.position.y = val
			},
		},
	},
	watch: {
		'tab.uuid'() {
			// this.treeEditor.receiveContainer(this.$refs.editorContainer)
		},
	},
}
</script>

<style scoped>
.grid-container {
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
}
.grid {
	position: relative;
	height: calc(100% + 84px);
	width: calc(100% + 84px);
	background-image: repeating-linear-gradient(
			#555555 0 1px,
			transparent 1px 100%
		),
		repeating-linear-gradient(90deg, #555555 0 1px, transparent 1px 100%);
	background-size: 42px 42px;
	background-repeat: repeat;
}
.theme--light .grid {
	background-image: repeating-linear-gradient(
			#a4a4a4 0 1px,
			transparent 1px 100%
		),
		repeating-linear-gradient(90deg, #a4a4a4 0 1px, transparent 1px 100%);
}
</style>
