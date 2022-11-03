<template>
	<v-btn
		@click="action.trigger()"
		:style="platform() === 'darwin' ? `border-radius: 8px` : undefined"
		:text="!isMinimalDisplay"
		small
		:icon="isMinimalDisplay"
	>
		<v-icon
			:color="action.accent || 'accent'"
			:class="{ 'mr-1': true, 'ml-1': isMinimalDisplay }"
			small
		>
			{{ action.icon }}
		</v-icon>
		<span
			v-if="!isMinimalDisplay"
			:style="{
				'text-transform': 'none',
				'font-weight': 'unset',
				color: isDarkMode
					? 'rgba(255, 255, 255, 0.7)'
					: 'rgba(0, 0, 0, 0.6)',
			}"
		>
			{{ t(action.name) }}
		</span>
	</v-btn>
</template>

<script setup>
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { platform } from '/@/utils/os'
import { useDarkMode } from '/@/components/Composables/useDarkMode'
import { useTranslations } from '/@/components/Composables/useTranslations.ts'
import { useDisplay } from '/@/components/Composables/Display/useDisplay.ts'

const { t } = useTranslations()

defineProps({
	action: {
		type: SimpleAction,
		required: true,
	},
})

const { isDarkMode } = useDarkMode()
const { isMinimalDisplay } = useDisplay()
</script>
