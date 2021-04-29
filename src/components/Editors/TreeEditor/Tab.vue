<template>
	<div class="pr-4 code-font" :style="`height: ${height}px; overflow: auto;`">
		<component
			:is="tab.treeEditor.tree.component"
			:tree="tab.treeEditor.tree"
		/>
	</div>
</template>

<script>
export default {
	name: 'TreeTab',
	props: {
		tab: Object,
		height: Number,
	},
}
</script>
