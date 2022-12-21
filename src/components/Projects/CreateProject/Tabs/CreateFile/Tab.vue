<template>
	<div>
		<h2 class="mb-2">{{ t('windows.createProject.categories.files') }}</h2>

		<v-row dense>
			<v-col
				v-for="(file, i) in window.packCreateFiles"
				:key="`${i}-${file.id}`"
				xs="12"
				sm="6"
				md="4"
				lg="3"
				xl="3"
			>
				<CreateFile
					:file="file"
					v-model="file.isActive"
					style="height: 100%"
					:dark="false"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts" setup>
import { useTranslations } from '/@/components/Composables/useTranslations'
import CreateFile from './Toggle.vue'

const props = defineProps(['window'])
const state = props.window.state

const { t } = useTranslations()
</script>
