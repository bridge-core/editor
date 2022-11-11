<template>
	<div v-if="data.length > 0">
		<Sheet
			v-for="([msg, { type }], i) in data"
			:key="`${type}//${msg}//${i}`"
			class="pa-2 mb-2 d-flex"
			style="overflow: auto"
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

<script>
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import Sheet from '/@/components/UIElements/Sheet.vue'

export default {
	props: {
		data: Array,
	},
	mixins: [TranslationMixin],
	components: {
		Sheet,
	},
	methods: {
		getIconData(type) {
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
		},
		getMessageParts(msg) {
			return msg.split('\n')
		},
	},
}
</script>
