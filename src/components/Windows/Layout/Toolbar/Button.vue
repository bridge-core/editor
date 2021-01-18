<template>
	<v-btn @click="$emit('click')" icon small>
		<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
			{{ icon }}
		</v-icon>
	</v-btn>
</template>

<script>
export default {
	name: 'ToolbarButton',
	props: {
		icon: {
			type: String,
		},
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>
