<template>
	<InfoPanel :infoPanel="data" />
</template>

<script>
import InfoPanel from '/@/components/InfoPanel/InfoPanel.vue'

export default {
	props: {
		data: Object,
	},
	components: {
		InfoPanel,
	},
}
</script>
