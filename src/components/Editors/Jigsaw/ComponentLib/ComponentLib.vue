<template>
	<div class="outlined rounded-lg pa-2" style="width: 200px; height: 100%">
		<v-combobox outlined dense />
		<JigsawNode :boundToGrid="false" icon="mdi-heart" />
		<JigsawNode :boundToGrid="false" icon="mdi-shoe-print" color="info" />
		<JigsawNode :boundToGrid="false" icon="mdi-sword" color="toolbar" />
		<JigsawNode :boundToGrid="false" icon="mdi-camera-timer" color="info" />
		<EventLine :boundToGrid="false" />
	</div>
</template>

<script>
import EventLine from '../EventLine.vue'
import JigsawNode from '../JigsawNode.vue'

export default {
	components: {
		JigsawNode,
		EventLine,
	},
}
</script>
