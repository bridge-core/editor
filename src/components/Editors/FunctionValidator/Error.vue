<template>
	<p class="error-info">
		<i class="mdi mdi-alert-octagon mr-1-2"></i> {{ alertText }}
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

.error-info {
	background: rgb(var(--v-theme-error));
	padding: 0.4rem;
	border-radius: 0.4rem;
}
</style>
