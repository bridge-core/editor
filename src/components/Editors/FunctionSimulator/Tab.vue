<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="d-flex wh-100 flex-column">
			<div class="d-flex flex-grow-1 wh-100 mh-50">
				<div
					class="d-flex align-center justify-start wh-100 border flex-column mw-50"
				>
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

				<div
					class="d-flex align-center justify-start wh-100 border flex-column mw-50"
				>
					<h2>Line Inspector</h2>
					<p
						id="function-simulator-line-inspector-text"
						class="w-e-100 overflow-scroll"
					></p>
				</div>
			</div>

			<div class="d-flex flex-grow-1 wh-100 mh-50">
				<div
					class="d-flex align-center justify-start wh-100 border flex-column mw-50"
				>
					<h2>World Simulator</h2>
				</div>

				<div
					class="d-flex align-center justify-start wh-100 border flex-column mw-50"
				>
					<h2>Inspector / Log</h2>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'FunctionSimulatorTab',
	props: {
		tab: Object,
	},
}
</script>

<style scoped>
.wh-100 {
	width: 100%;
	height: 100%;
}

.w-100 {
	width: 100%;
}

.border {
	border: thin solid rgba(255, 255, 255, 0.12);
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
</style>
