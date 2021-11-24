<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="wh-100 ml-1 mr-1">
			<h2>Inspector / Log</h2>

			<div class="d-flex align-center justify-center w-e-100 mb-1">
				<button class="icon-back" v-on:click="runFunction">
					<i class="mdi mdi-play ok-icon font-size-2 scale-1-2"></i>
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

				<div id="alerts"></div>

				<p>Documentation:</p>

				<p id="docs">I am docs :D TUTORIAL TUTR+ORIAL LERARARARN</p>
			</div>
		</div>
	</div>
</template>

<script>
import Button from '../../Sidebar/Button.vue'
import Error from './Error.vue'
import Warning from './Warning.vue'

export default {
	name: 'FunctionValidatorTab',
	props: {
		tab: Object,
	},
	components: {
		Error,
		Warning,
		Button,
	},
	methods: {
		runFunction: function (event) {
			this.tab.Play().then(() => {})
		},
		stepLine: function (event) {
			this.tab.StepLine().then(() => {})
		},
		restart: function (event) {
			this.tab.Restart().then(() => {})
		},
	},
}
</script>

<style>
.error-line {
	text-decoration-line: underline;
	text-decoration-style: solid;
	text-decoration-color: var(--v-error-base);
	text-decoration-skip-ink: none;
	text-underline-offset: 0.1rem;
	text-decoration-thickness: 0.15rem;
}

.warning-line {
	text-decoration-line: underline;
	text-decoration-style: solid;
	text-decoration-color: var(--v-warning-base);
	text-decoration-skip-ink: none;
	text-underline-offset: 0.1rem;
	text-decoration-thickness: 0.15rem;
}
</style>

<style scoped>
.wh-100 {
	width: 100%;
	height: 100%;
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

.ml-1 {
	margin-left: 1rem !important;
}

.mr-1 {
	margin-right: 1rem !important;
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
