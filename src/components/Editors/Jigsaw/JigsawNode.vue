<template>
	<GridElement
		:isEnabled="boundToGrid"
		:class="{
			[`component rounded-${roundedType}`]: true,
			'shake elevation-24': isDragging,
		}"
		:background="`var(--v-${color}-base)`"
		:cursor="cursorStyle"
		:x="position.x"
		:y="position.y"
		:containerX="containerX"
		:containerY="containerY"
		@mousedown.native="onMouseDown"
	>
		<div
			v-for="dir in connectTo"
			:key="dir"
			class="component rounded-lg connect"
			:style="{
				background: `var(--v-${color}-base)`,
				left: `${dir === 'left' ? 12 : dir === 'right' ? -12 : 0}px`,
				top: `${dir === 'up' ? -12 : dir === 'down' ? 12 : 0}px`,
			}"
		/>
		<v-icon>{{ icon }}</v-icon>
	</GridElement>
</template>

<script>
import GridElement from './FlowArea/GridElement.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { addDisposableEventListener } from '/@/utils/disposableListener'
import { disposableTimeout } from '/@/utils/disposableTimeout'

export default {
	components: { GridElement },
	mixins: [TranslationMixin],
	props: {
		boundToGrid: { type: Boolean, default: true },
		x: Number,
		y: Number,
		containerX: Number,
		containerY: Number,
		color: {
			default: 'error',
			type: String,
		},
		icon: String,
		type: {
			type: String,
			default: 'component',
			validate: (val) => ['component', 'event'].includes(val),
		},
		connect: {
			type: [Array, String],
			validate: (val) =>
				val.every((v) => ['left', 'right', 'up', 'down'].includes(v)),
		},
	},
	data: () => ({
		position: {
			x: 0,
			y: 0,
		},
		mouseUpFired: false,
		isDragging: false,
		disposables: null,
		cursorStyle: 'pointer',
		mouseUpTimeout: null,
		startPosData: null,
	}),
	mounted() {
		this.position.x = this.x
		this.position.y = this.y
	},
	computed: {
		roundedType() {
			switch (this.type) {
				case 'component':
					return 'lg'
				case 'event':
					return 'circle'
				default:
					return '0'
			}
		},
		connectTo() {
			return typeof this.connect === 'string'
				? [this.connect]
				: this.connect
		},
	},
	methods: {
		onMouseDown(event) {
			// Wait for last mouseUpTimeout to finish
			if (this.mouseUpTimeout) return
			this.mouseUpFired = false
			this.cursorStyle = 'grab'

			this.startPosData = {
				elementX: this.position.x,
				elementY: this.position.y,
				x: event.clientX,
				y: event.clientY,
			}

			this.mouseUpTimeout = disposableTimeout(() => {
				if (this.mouseUpFired) {
					this.onClick(event)
				} else {
					this.onDrag(event)
				}

				this.mouseUpTimeout = null
			}, 200)

			this.disposables = [
				addDisposableEventListener('mousemove', this.onMouseMove),
				addDisposableEventListener('mouseup', this.onDragEnd),
			]
		},
		onDrag(event) {
			this.isDragging = true
			this.cursorStyle = 'grabbing'
		},
		onClick() {
			console.log('click')
			this.cursorStyle = 'pointer'
		},
		onMouseMove(event) {
			if (!this.isDragging) {
				this.onDrag(event)
			}

			const { x, y, elementX, elementY } = this.startPosData

			const dx = event.clientX - x
			const dy = event.clientY - y
			this.position.x = Math.round((elementX * 42 + dx) / 42)
			this.position.y = Math.round((elementY * 42 + dy) / 42)
		},
		onDragEnd() {
			this.isDragging = false
			this.cursorStyle = 'pointer'

			this.mouseUpFired = true
			if (this.disposables)
				this.disposables.forEach((disposable) => disposable.dispose())
			this.disposables = null
			this.startPosData = null
		},
	},
}
</script>

<style scoped>
.component {
	user-select: none;
	display: inline-grid;
	height: 37px;
	width: 37px;
}
.connect {
	position: absolute;
	transform: rotate(45deg) scale(0.5);
}

.shake {
	z-index: 1;
	animation: shake 1s;
	animation-iteration-count: infinite;
	transform: scale(1.2);
}

@keyframes shake {
	10%,
	90% {
		transform: translate(-1px, 0) rotate(3deg) scale(1.2);
	}

	20%,
	80% {
		transform: translate(2px, 0) rotate(-5deg) scale(1.2);
	}

	30%,
	50%,
	70% {
		transform: translate(-4px, 0) rotate(7deg) scale(1.2);
	}

	40%,
	60% {
		transform: translate(4px, 0) rotate(-7deg) scale(1.2);
	}
}
</style>
