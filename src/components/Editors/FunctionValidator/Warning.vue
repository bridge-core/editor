<template>
	<p class="warning-info">
		<i class="mdi mdi-alert-circle mr-1-2"></i> {{ alertText }}
	</p>
</template>

<script>
export default {
	name: 'Error',
	props: {
		alertText: String,
	},
}
</script>

<style scoped>
.mr-1-2 {
	margin-right: 0.5rem !important;
}

.warning-info {
	background: var(--v-warning-base);
	padding: 0.4rem;
	border-radius: 0.4rem;
}
</style>
