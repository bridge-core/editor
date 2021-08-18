<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="d-flex wh-100 flex-column">
			<div class="border half">
				<h2>Call Stack</h2>

				<div
					class="d-flex align-start justify-start flex-column wh-100 w-e-100"
				>
					<div class="d-flex align-start justify-start">
						<button
							class="mdi mdi-arrow-down-drop-circle mr-1-2"
						></button>
						<p class="mb-0">Function1</p>
					</div>
					<div
						class="d-flex align-start justify-start flex-column wh-100 ml-1"
					>
						<div class="d-flex align-start justify-start">
							<button
								class="mdi mdi-arrow-right-drop-circle mr-1-2"
							></button>
							<p class="mb-0">Function2</p>
						</div>
					</div>
				</div>
			</div>

			<div class="border half">
				<h2>Inspector / Log</h2>

				<div class="d-flex align-center justify-center w-e-100 mb-1">
					<button class="icon-back">
						<i
							class="mdi mdi-play ok-icon font-size-2 scale-1-2"
						></i>
					</button>
					<button class="icon-back" v-on:click="stepLine">
						<i
							class="mdi mdi-debug-step-over info-icon font-size-2 scale-1-2"
						></i>
					</button>
					<button class="icon-back" v-on:click="restart">
						<i
							class="mdi mdi-restart error-icon font-size-2 scale-1-2"
						></i>
					</button>
				</div>

				<div
					class="d-flex align-start justify-start wh-100 w-e-100 flex-column overflow-scroll"
				>
					<p id="line-counter">Line: 4</p>

					<p id="command-display">Command: give</p>

					<p id="full-command-display">Full Command: give</p>

					<Error alertText="Test Warning" />

					<Warning alertText="Test Text" />

					<p>Documentation:</p>

					<p>I am docs :D TUTORIAL TUTR+ORIAL LERARARARN</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Button from '../../Sidebar/Button.vue'
import Error from './Error.vue'
import Warning from './Warning.vue'

export default {
	name: 'FunctionSimulatorTab',
	props: {
		tab: Object,
	},
	components: {
		Error,
		Warning,
		Button,
	},
	methods: {
		stepLine: function (event) {
			console.log('stepLine')

			this.tab.currentLine += 1
			this.tab.loadCurrentLine()
		},
		restart: function (event) {
			console.log('restart')

			this.tab.currentLine = 0
			this.tab.loadCurrentLine()
		},
	},
}
</script>

<style scoped>
.half {
	display: flex;
	flex-grow: 1;
	justify-content: start;
	align-items: center;
	flex-direction: column;

	height: 50%;
	width: 100%;
}

.wh-100 {
	width: 100%;
	height: 100%;
}

.m-h-50 {
	max-height: 50%;
}

.w-100 {
	width: 100%;
}

.border {
	border: thin solid var(--v-lineHighlightBackground-base);
}

.w-e-100 {
	width: calc(100% - 3rem);
}

.overflow-scroll {
	overflow-x: scroll;
	overflow-y: scroll;
}

.mw-50 {
	max-width: 50%;
}

.mh-50 {
	max-height: 50%;
}

.ml-1 {
	margin-left: 1rem !important;
}

.mr-1-2 {
	margin-right: 0.5rem !important;
}

.mb-0 {
	margin-bottom: 0rem !important;
}

.warning-info {
	background: var(--v-warning-base);
	padding: 0.4rem;
	border-radius: 0.4rem;
}

.error-info {
	background: var(--v-error-base);
	padding: 0.4rem;
	border-radius: 0.4rem;
}

.font-size-2 {
	font-size: 1rem;
}

.ok-icon {
	color: var(--v-success-base);
}

.warning-icon {
	color: var(--v-warning-base);
}

.error-icon {
	color: var(--v-error-base);
}

.info-icon {
	color: var(--v-info-base);
}

.scale-1-2 {
	transform: scale(1.5);
}

.icon-back {
	background: var(--v-expandedSidebar-base);
	border-radius: 0.4rem;
	width: 1.8rem;
	height: 1.8rem;
	display: flex;
	justify-content: center;
	align-items: center;

	margin-left: 0.25rem;
	margin-right: 0.25rem;
}

.mb-1 {
	margin-bottom: 1rem !important;
}
</style>
