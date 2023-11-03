<template>
	<div class="d-flex flex-column m-auto w-72">
		<Logo
			style="height: 160px; width: 160px"
			class="ml-auto mr-auto mb-12"
			alt="Logo of bridge. v2"
		/>
		<p class="mb-1 text-lg">Projects</p>
		<div class="seperator" />
		<div class="project-list">
			<div class="project">
				<Logo class="mr-2" style="height: 40px; width: 40px" />
				<p>My New Bridge Project</p>
			</div>
			<div class="project">
				<Logo class="mr-2" style="height: 40px; width: 40px" />
				<p>Scripting Testing Project</p>
			</div>
			<div class="project">
				<Logo class="mr-2" style="height: 40px; width: 40px" />
				<p>Experiments</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import Logo from '/@/components/UIElements/Logo.vue'
</script>

<style scoped>
.seperator {
	height: 1px;
	width: 100%;
	background-color: var(--v-menu-base);

	margin-bottom: 1rem;
}

.project {
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
}

.project > p {
	margin: 0;
}
</style>
