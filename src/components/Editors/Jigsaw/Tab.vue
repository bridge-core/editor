<template>
	<div
		class="editor-container d-flex px-3 pb-3"
		:style="{
			fontSize,
			fontFamily: codeFontFamily,
			height: `${height - 12}px`,
			gap: '8px',
		}"
		ref="editorContainer"
		@click="tab.parent.setActive(true)"
		tabindex="-1"
	>
		<ComponentLib />
		<div
			class="grid-container outlined rounded-lg"
			:style="{ cursor: cursorStyle }"
		>
			<Grid :x="currentX" :y="currentY" @mousedown.self="onMouseDown" />
			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				icon="mdi-heart"
				:x="2"
				:y="1"
			/>
			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				icon="mdi-shoe-print"
				color="info"
				:x="1"
				:y="1"
			/>
			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				icon="mdi-sword"
				color="toolbar"
				:x="1"
				:y="2"
			/>
			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				:connect="['left', 'down']"
				icon="mdi-camera-timer"
				color="info"
				:x="2"
				:y="2"
			/>

			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				:x="3"
				:y="2"
			/>
			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				:x="4"
				:y="2"
			/>
			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				:x="5"
				:y="2"
			/>

			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				:connect="['left']"
				icon="mdi-filter"
				color="success"
				type="event"
				:x="6"
				:y="2"
			/>

			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				color="success"
				:x="7"
				:y="2"
			/>
			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				color="success"
				:x="8"
				:y="2"
			/>
			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				color="success"
				:x="9"
				:y="2"
			/>
			<EventLine
				:containerX="currentX"
				:containerY="currentY"
				color="success"
				:x="10"
				:y="2"
			/>

			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				icon="mdi-heart"
				:x="11"
				:y="2"
			/>
			<JigsawNode
				:containerX="currentX"
				:containerY="currentY"
				icon="mdi-shoe-print"
				color="info"
				:x="12"
				:y="2"
			/>
		</div>
	</div>
</template>

<script>
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import JigsawNode from './JigsawNode.vue'
import EventLine from './EventLine.vue'
import ComponentLib from './ComponentLib/ComponentLib.vue'
import Grid from './FlowArea/Grid.vue'
import { addDisposableEventListener } from '/@/utils/disposableListener'

export default {
	mixins: [TranslationMixin],
	components: { JigsawNode, EventLine, ComponentLib, Grid },
	props: {
		tab: Object,

		height: Number,
	},
	data: () => ({
		cursorStyle: 'grab',
		startPosData: null,
		disposables: null,
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
			this.disposables = [
				addDisposableEventListener('mousemove', this.onMouseMove),
				addDisposableEventListener('mouseup', this.onMouseUp),
			]
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
			if (this.disposables)
				this.disposables.forEach((disposable) => disposable.dispose())
			this.disposables = null
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
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	user-select: none;
}
</style>
