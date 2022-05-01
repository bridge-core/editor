<template>
	<div class="outlined rounded-lg pa-2" style="width: 200px; height: 100%">
		<v-combobox outlined dense />
		<JigsawNode :boundToGrid="false" icon="mdi-heart" :x="2" :y="1" />
		<JigsawNode
			:boundToGrid="false"
			icon="mdi-shoe-print"
			color="info"
			:x="1"
			:y="1"
		/>
		<JigsawNode
			:boundToGrid="false"
			icon="mdi-sword"
			color="toolbar"
			:x="1"
			:y="2"
		/>
		<JigsawNode
			:boundToGrid="false"
			icon="mdi-camera-timer"
			color="info"
			:x="2"
			:y="2"
		/>
	</div>
</template>

<script>
import JigsawNode from '../JigsawNode.vue'

export default {
	components: {
		JigsawNode,
	},
}
</script>

<style></style>
