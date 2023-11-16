<template>
	<img
		draggable="false"
		:src="logoPath"
		alt="Logo of bridge. v2"
		class="select-none drag-none"
	/>
</template>

<script setup lang="ts">
import { isNightly } from '/@/libs/app/isNightly'

const logoPath = isNightly
	? `/img/icons/nightly/favicon.svg`
	: `/img/icons/favicon.svg`
</script>
