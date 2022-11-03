<template>
	<span v-on="$listeners" class="icon-name" :style="{ opacity }">
		<v-icon class="pr-1" :color="color" small>
			{{ icon }}
		</v-icon>

		<span
			v-if="showName"
			:style="{
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis',
			}"
		>
			{{ name }}
		</span>
	</span>
</template>

<script>
export default {
	props: {
		name: String,
		icon: String,
		color: String,
		opacity: Number,
		showName: {
			type: Boolean,
			default: true,
		},
	},
}
</script>

<style scoped>
.icon-name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
