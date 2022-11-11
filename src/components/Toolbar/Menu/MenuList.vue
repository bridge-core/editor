<template>
	<!-- "tile" prop doesn't work on nested lists -> set border radius directly -->
	<v-list class="app-menu" color="menu" style="border-radius: 0">
		<template v-for="(item, key, i) in elements" :key="`menu.${i}`">
			<v-divider v-if="item.type === 'divider'" />
			<v-menu
				v-else
				open-on-hover
				offset-x
				z-index="11"
				:nudge-top="-8"
				rounded="lg"
			>
				<template v-slot:activator="{ props }">
					<v-list-item
						dense
						v-bind="item.type === 'category' ? props : undefined"
						color="accent"
						@click="onClick(item)"
						:disabled="item.isDisabled"
					>
						<template v-if="item.icon" v-slot:prepend>
							<v-icon color="accent" small>{{
								item.icon
							}}</v-icon>
						</template>

						<span style="font-size: 13px">{{ t(item.name) }}</span>

						<template v-slot:append>
							<span
								v-if="
									item.type !== 'category' && item.keyBinding
								"
								class="ml-4 text-disabled"
							>
								{{ item.keyBinding.toStrKeyCode() }}
							</span>
							<v-icon v-if="item.type === 'category'" small>
								mdi-chevron-right
							</v-icon>
						</template>
					</v-list-item>
				</template>

				<MenuList :elements="item.state" />
			</v-menu>
		</template>
	</v-list>
</template>

<script setup>
import { useTranslations } from '/@/components/Composables/useTranslations.ts'

const { t } = useTranslations()

defineProps({
	elements: Object,
})

function onClick(item) {
	item.trigger()
}
</script>
