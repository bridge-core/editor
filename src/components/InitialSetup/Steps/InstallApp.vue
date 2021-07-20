<template>
	<v-card color="transparent" elevation="0" rounded="lg">
		<v-card-actions>
			<v-btn color="primary" @click="onClick" :disabled="buttonDisabled">
				<v-icon class="mr-1">mdi-download</v-icon>
				{{ t('sidebar.notifications.installApp.message') }}
			</v-btn>

			<v-spacer />

			<v-btn @click="$emit('next')">{{ t('general.skip') }}</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import { App } from '/@/App.ts'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	mixins: [TranslationMixin],
	data: () => ({
		buttonDisabled: false,
	}),
	methods: {
		async onClick() {
			App.installApp.prompt()
		},
	},
}
</script>
