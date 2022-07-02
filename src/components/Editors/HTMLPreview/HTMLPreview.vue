<template>
	<div class="pa-2" style="overflow: auto" v-html="tab.html"></div>
</template>

<script>
export default {
	name: 'HTMLPreviewTab',
	props: {
		tab: Object,
	},
}
</script>
