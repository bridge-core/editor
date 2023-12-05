<template>
	<Window :name="t('windows.changelogWindow.title')" id="changelog">
		<div class="max-w-2xl overflow-auto h-[42rem] p-8">
			<div v-html="content" class="changelog" />
		</div>
	</Window>
</template>

<script lang="ts" setup>
import Window from '@/components/Windows/Window.vue'

import { onMounted, ref } from 'vue'
import { baseUrl } from '@/libs/app/BaseUrl'
import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()

const content = ref('')

onMounted(async () => {
	const response = await fetch(baseUrl + 'changelog.html')
	content.value = await response.text()
})
</script>

<style>
.changelog ul {
	margin-bottom: 24px;
}

.changelog img {
	max-width: 100%;

	@apply mt-4 mb-4;
}

.changelog h1 {
	@apply text-3xl font-bold mb-4;
}
.changelog h2 {
	@apply text-2xl font-semibold mb-2;
}
.changelog h3 {
	@apply text-xl font-semibold mb-2;
}
.changelog h4 {
	@apply text-lg font-medium;
}
.changelog h5 {
	@apply text-base font-semibold;
}
.changelog h6 {
	@apply text-base font-medium;
}

.changelog p {
	@apply text-base font-normal mb-2;
}

.changelog hr {
	@apply my-6;
}
</style>
