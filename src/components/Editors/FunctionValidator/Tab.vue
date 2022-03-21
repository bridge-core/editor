<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="wh-100 ml-1 mr-1">
			<h2>Inspector / Log</h2>

			<div class="lds-default" id="data-loading">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>

			<div
				class="d-flex align-start justify-start wh-100 w-e-100 flex-column overflow-scroll hidden"
				id="loaded-content"
			>
				<div class="d-flex align-center justify-center w-e-100 mb-1">
					<button class="icon-back" v-on:click="runFunction">
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

				<p id="line-counter">Line: 4</p>

				<p id="full-command-display">Full Command: give</p>

				<div id="alerts"></div>

				<p class="m-b-small">Description:</p>

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
	text-decoration-color: rgb(var(--v-theme-error));
	text-decoration-skip-ink: none;
	text-underline-offset: 0.1rem;
	text-decoration-thickness: 0.15rem;
}

.warning-line {
	text-decoration-line: underline;
	text-decoration-style: solid;
	text-decoration-color: rgb(var(--v-theme-warning));
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
	border: thin solid rgb(var(--v-theme-lineHighlightBackground));
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

.m-b-small {
	margin-bottom: 0.5rem !important;
}

.warning-info {
	background: rgb(var(--v-theme-warning));
	padding: 0.4rem;
	border-radius: 0.4rem;
}

.error-info {
	background: rgb(var(--v-theme-error));
	padding: 0.4rem;
	border-radius: 0.4rem;
}

.font-size-2 {
	font-size: 1rem;
}

.ok-icon {
	color: rgb(var(--v-theme-success));
}

.warning-icon {
	color: rgb(var(--v-theme-warning));
}

.error-icon {
	color: rgb(var(--v-theme-error));
}

.info-icon {
	color: rgb(var(--v-theme-info));
}

.scale-1-2 {
	transform: scale(1.5);
}

.icon-back {
	background: rgb(var(--v-theme-expandedSidebar));
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

.lds-default {
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
}
.lds-default div {
	position: absolute;
	width: 6px;
	height: 6px;
	background: #fff;
	border-radius: 50%;
	animation: lds-default 1.2s linear infinite;
}
.lds-default div:nth-child(1) {
	animation-delay: 0s;
	top: 37px;
	left: 66px;
}
.lds-default div:nth-child(2) {
	animation-delay: -0.1s;
	top: 22px;
	left: 62px;
}
.lds-default div:nth-child(3) {
	animation-delay: -0.2s;
	top: 11px;
	left: 52px;
}
.lds-default div:nth-child(4) {
	animation-delay: -0.3s;
	top: 7px;
	left: 37px;
}
.lds-default div:nth-child(5) {
	animation-delay: -0.4s;
	top: 11px;
	left: 22px;
}
.lds-default div:nth-child(6) {
	animation-delay: -0.5s;
	top: 22px;
	left: 11px;
}
.lds-default div:nth-child(7) {
	animation-delay: -0.6s;
	top: 37px;
	left: 7px;
}
.lds-default div:nth-child(8) {
	animation-delay: -0.7s;
	top: 52px;
	left: 11px;
}
.lds-default div:nth-child(9) {
	animation-delay: -0.8s;
	top: 62px;
	left: 22px;
}
.lds-default div:nth-child(10) {
	animation-delay: -0.9s;
	top: 66px;
	left: 37px;
}
.lds-default div:nth-child(11) {
	animation-delay: -1s;
	top: 62px;
	left: 52px;
}
.lds-default div:nth-child(12) {
	animation-delay: -1.1s;
	top: 52px;
	left: 62px;
}
@keyframes lds-default {
	0%,
	20%,
	80%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.75);
	}
}

#data-loading {
	margin-left: calc(50% - 65px);
}

.hidden {
	display: none !important;
}
</style>
