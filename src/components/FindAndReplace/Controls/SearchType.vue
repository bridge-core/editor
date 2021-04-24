<template>
	<v-btn-toggle dense mandatory :value="value" @input="$emit('input')">
		<v-btn title="Match Case">
			<v-icon>mdi-format-letter-case-upper</v-icon>
		</v-btn>

		<v-btn title="Ignore Case">
			<v-icon>mdi-format-letter-case</v-icon>
		</v-btn>

		<v-btn title="Use Regular Expression">
			<v-icon>mdi-regex</v-icon>
		</v-btn>
	</v-btn-toggle>
</template>

<script>
export default {
	name: 'SearchType',
	props: {
		value: Number,
	},
}
</script>
