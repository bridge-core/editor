<template>
	<div
		class="d-flex px-1 mx-1 align-center action"
		:style="{
			opacity: action.isDisabled ? 0.2 : 1,
			cursor: !action.isDisabled ? 'pointer' : null,
		}"
		v-ripple="!action.isDisabled"
		@click="onClick"
	>
		<v-icon :color="action.color || 'primary'" class="mr-1" small>
			{{ action.icon }}
		</v-icon>
		<span class="action-name">{{ t(action.name) }}</span>
	</div>
</template>

<script setup>
import { useTranslations } from '../../Composables/useTranslations.ts'
import { SimpleAction } from '/@/components/Actions/SimpleAction'

const { t } = useTranslations()

const props = defineProps({
	action: {
		type: SimpleAction,
		required: true,
	},
})
const emit = defineEmits(['click'])

function onClick() {
	emit('click')
	props.action.trigger()
}
</script>

<style scoped>
.action {
	border-radius: 8px;
}

.action .action-name {
	opacity: 0.7;
	font-size: 14px;
	white-space: nowrap;
}
</style>
