<template>
	<iframe class="pa-2" style="overflow: auto" sandbox="" srcdoc="tab.html" />
</template>

<script>
export default {
	name: 'HTMLPreviewTab',
	props: {
		tab: Object,
	},
}
</script>

<style scoped>
iframe {
	border: 0;
}
</style>
