<template>
	<div
		class="d-flex align-center justify-center"
		style="height:calc(100% - 48px); width: 100%;"
	>
		<img
			:src="tab.dataUrl"
			:alt="tab.path"
			style="height:calc(80% - 48px);"
		/>
	</div>
</template>

<script>
export default {
	name: 'ImageTab',
	props: {
		tab: Object,
	},
}
</script>

<style></style>
