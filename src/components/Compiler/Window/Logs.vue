<template>
	<div
		v-if="data.length > 0"
		ref="scrollElement"
		class="d-flex flex-col-reverse overflow-auto"
	>
		<Sheet
			v-for="([msg, { type }], i) in data"
			:key="`${type}//${msg}//${i}`"
			class="pa-2 mb-2 d-flex"
		>
			<v-icon
				v-if="getIconData(type)"
				:color="getIconData(type).color"
				class="mr-2"
			>
				{{ getIconData(type).icon }}
			</v-icon>

			<div>
				<template v-for="(line, i) in getMessageParts(msg)">
					<span :key="`line-${i}`">{{ line }}</span>
					<br :key="`break-${i}`" />
				</template>
			</div>
		</Sheet>
	</div>
	<Sheet class="pa-2" v-else>
		{{ t('sidebar.compiler.categories.logs.noLogs') }}
	</Sheet>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useTranslations } from '/@/components/Composables/useTranslations'
import Sheet from '/@/components/UIElements/Sheet.vue'

const { t } = useTranslations()

const props = defineProps(['data'])

const scrollElement: Ref<any> = ref(null)

function getIconData(type: any): any {
	if (!type) return null

	switch (type) {
		case 'info':
			return {
				color: 'info',
				icon: 'mdi-information-outline',
			}
		case 'warning':
			return {
				color: 'warning',
				icon: 'mdi-alert-outline',
			}
		case 'error':
			return {
				color: 'error',
				icon: 'mdi-alert-circle-outline',
			}
		default:
			return null
	}
}

function getMessageParts(msg: any) {
	return msg.split('\n')
}

export function open() {
	console.log(scrollElement.value)

	setInterval(() => {
		if (!scrollElement.value) return

		console.log(
			scrollElement.value.scrollTop,
			scrollElement.value.scrollHeight
		)

		scrollElement.value.scrollTo({
			top: 100,
			behavior: 'instant',
		})

		console.log(
			scrollElement.value.scrollTop,
			scrollElement.value.scrollHeight
		)
	}, 10)
}
</script>
