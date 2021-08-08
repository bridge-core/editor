<template>
	<div
		class="d-flex align-start justify-center"
		@click="tab.parent.setActive(true)"
	>
		<div class="d-flex wh-100">
			<div class="d-flex wh-100 flex-column">
				<div
					class="d-flex align-center justify-start wh-100 border m-h-50 flex-column"
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
					class="d-flex align-center justify-start wh-100 border m-h-50 flex-column"
				>
					<h2>Line Inspector</h2>
					<p
						id="function-simulator-line-inspector-text"
						class="w-e-100 overflow-scroll"
					></p>
				</div>
			</div>

			<div
				class="d-flex align-center justify-start wh-100 border flex-column mw-50"
			>
				<h2>Inspector / Log</h2>

				<div class="d-flex align-center justify-center w-e-100 mb-1">
					<div class="icon-back">
						<button
							class="mdi mdi-play ok-icon font-size-2 scale-1-2"
						></button>
					</div>
					<div class="icon-back">
						<button
							class="mdi mdi-debug-step-over info-icon font-size-2 scale-1-2"
						></button>
					</div>
					<div class="icon-back">
						<button
							class="mdi mdi-stop error-icon font-size-2 scale-1-2"
						></button>
					</div>
				</div>

				<div
					class="d-flex align-start justify-start wh-100 w-e-100 flex-column overflow-scroll"
				>
					<p>Line: 4</p>
					<p>Command: give</p>
					<p class="warning-info">
						<i class="mdi mdi-alert-circle mr-1-2"></i
						>"sp:sapphire_leggings" Not found as an item or block.
						Ignore this if this item / block is from another pack.
					</p>
					<p class="error-info">
						<i class="mdi mdi-alert-octagon mr-1-2"></i>Example
						Error for Testing
					</p>
					<p>Docs:</p>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit,
						sed do eiusmod tempor incididunt ut labore et dolore
						magna aliqua. Facilisis leo vel fringilla est
						ullamcorper eget nulla. Lectus sit amet est placerat in
						egestas erat imperdiet sed. Vestibulum lectus mauris
						ultrices eros in. Dictumst quisque sagittis purus sit.
						Sit amet nulla facilisi morbi tempus iaculis. Eget
						gravida cum sociis natoque penatibus et magnis dis. Et
						netus et malesuada fames ac. Sem fringilla ut morbi
						tincidunt augue interdum velit. Parturient montes
						nascetur ridiculus mus mauris vitae ultricies. Duis
						tristique sollicitudin nibh sit amet commodo nulla. Quis
						ipsum suspendisse ultrices gravida dictum fusce.
						Facilisis sed odio morbi quis commodo odio aenean sed.
						Commodo quis imperdiet massa tincidunt. Aliquam ultrices
						sagittis orci a scelerisque purus semper eget duis.
						Vulputate eu scelerisque felis imperdiet proin fermentum
						leo vel orci. Id donec ultrices tincidunt arcu non
						sodales neque sodales. Facilisis leo vel fringilla est
						ullamcorper eget nulla facilisi etiam. Sit amet mauris
						commodo quis imperdiet. Libero id faucibus nisl
						tincidunt eget. Semper auctor neque vitae tempus quam
						pellentesque nec nam. Ut tellus elementum sagittis vitae
						et. Orci porta non pulvinar neque. Ultricies mi eget
						mauris pharetra et ultrices neque. Mi bibendum neque
						egestas congue. Sit amet dictum sit amet justo. Lobortis
						elementum nibh tellus molestie. Volutpat consequat
						mauris nunc congue nisi. Elementum integer enim neque
						volutpat ac tincidunt vitae semper quis. Pellentesque
						elit ullamcorper dignissim cras. Amet purus gravida quis
						blandit turpis. Platea dictumst vestibulum rhoncus est
						pellentesque elit ullamcorper. Tortor aliquam nulla
						facilisi cras fermentum odio. Risus viverra adipiscing
						at in tellus. Augue lacus viverra vitae congue eu.
						Tincidunt lobortis feugiat vivamus at augue. Adipiscing
						diam donec adipiscing tristique. Risus in hendrerit
						gravida rutrum quisque. Tincidunt tortor aliquam nulla
						facilisi. Nec feugiat nisl pretium fusce id velit ut
						tortor. Magna fringilla urna porttitor rhoncus dolor
						purus. Dictumst vestibulum rhoncus est pellentesque elit
						ullamcorper dignissim. Tellus in metus vulputate eu
						scelerisque felis imperdiet proin fermentum.
					</p>
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
