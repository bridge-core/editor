<template>
	<v-btn-toggle
		dense
		mandatory
		:value="value"
		@change="(val) => $emit('input', val)"
	>
		<v-btn title="Match Case" color="menu" style="min-width: unset">
			<v-icon>mdi-format-letter-case-upper</v-icon>
		</v-btn>

		<v-btn title="Ignore Case" color="menu" style="min-width: unset">
			<v-icon>mdi-format-letter-case</v-icon>
		</v-btn>

		<v-btn
			title="Use Regular Expression"
			color="menu"
			style="min-width: unset"
		>
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
