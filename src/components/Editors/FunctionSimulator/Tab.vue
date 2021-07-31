<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="d-flex flex-grow-1 wh-100 flex-column">
			<div class="d-flex flex-grow-1 wh-100">
				<div class="d-flex align-start justify-center wh-100 border">
					<h2>Call Stack</h2>
				</div>

				<div class="d-flex align-start justify-center wh-100 border">
					<h2>Line Inspector</h2>
					<p></p>
				</div>
			</div>

			<div class="d-flex flex-grow-1 wh-100">
				<div class="d-flex align-start justify-center wh-100 border">
					<h2>World Simulator</h2>
				</div>

				<div class="d-flex align-start justify-center wh-100 border">
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

.border {
	border: thin solid rgba(255, 255, 255, 0.12);
}
</style>
