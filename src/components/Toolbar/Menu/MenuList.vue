<template>
	<!-- "tile" prop doesn't work on nested lists -> set border radius directly -->
	<v-list class="app-menu" color="menu" style="border-radius: 0">
		<template v-for="(item, key, i) in elements">
			<v-divider
				v-if="item.type === 'divider'"
				:key="`menu.${i}.${Math.random()}`"
			/>
			<v-menu
				v-else
				:key="`menu.${i}.${Math.random()}`"
				open-on-hover
				offset-x
				z-index="11"
				:nudge-top="-8"
				rounded="lg"
			>
				<template v-slot:activator="{ on }">
					<v-list-item
						dense
						v-on="item.type === 'category' ? on : undefined"
						@click="onClick(item)"
						:disabled="item.isDisabled"
					>
						<v-list-item-icon v-if="item.icon">
							<v-icon color="accent" small>{{
								item.icon
							}}</v-icon>
						</v-list-item-icon>

						<v-list-item-content>
							<v-list-item-title>
								{{ t(item.name) }}
							</v-list-item-title>
						</v-list-item-content>

						<v-list-item-action>
							<v-list-item-action-text>
								<span
									v-if="
										item.type !== 'category' &&
										item.keyBinding
									"
								>
									{{ item.keyBinding.toStrKeyCode() }}
								</span>
								<v-icon v-if="item.type === 'category'" small>
									mdi-chevron-right
								</v-icon>
							</v-list-item-action-text>
						</v-list-item-action>
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
