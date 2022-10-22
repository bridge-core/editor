<template>
	<v-tooltip
		:color="color || 'tooltip'"
		:disabled="$vuetify.breakpoint.mobile"
		:open-delay="500"
		bottom
	>
		<template v-slot:activator="{ on, attrs }">
			<div
				v-ripple
				class="rounded-lg ma-1 d-flex justify-center sidebar-actions pa-2"
				:class="{ 'elevation-4': isSelected }"
				:style="{
					background: isSelected ? `var(--v-${color}-base)` : null,
					transform: isSelected ? 'scale(1.05)' : null,
				}"
				@click="$emit('click', $event)"
				v-on="on"
				v-bind="attrs"
			>
				<v-icon :color="isSelected ? 'white' : color">
					{{ icon }}
				</v-icon>
			</div>
		</template>
		<span>{{ t(name) }}</span>
	</v-tooltip>
</template>

<script setup>
import { useTranslations } from '/@/components/Composables/useTranslations'

defineProps({
	color: String,
	icon: String,
	name: String,
	isSelected: Boolean,
})

const { t } = useTranslations()
</script>

<style scoped>
.sidebar-actions {
	cursor: pointer;
	transition: all 0.1s ease-in-out;
	background-color: var(--v-sidebarSelection-base);
}
</style>
