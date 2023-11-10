<template>
	<!-- "tile" prop doesn't work on nested lists -> set border radius directly -->
	<v-list class="app-menu p-0" color="menu">
		<template v-for="(item, key, i) in elements">
			<v-divider
				v-if="item.type === 'divider'"
				:key="`menu.${i}.${Math.random()}`"
				class="mb-2 mt-1"
			/>
			<div
				v-else
				:key="`menu.${i}.${Math.random()}`"
				:class="{
					'pb-3': i === Object.keys(elements).length - 1,
					'pt-3': i === 0,
					'flex gap-4 p-2 hover:bg-surface transition-colors duration-200 ease-out align-center': true,
				}"
				@click="onClick(item)"
			>
				<v-icon v-if="item.icon" color="accent" small class="ml-1">{{
					item.icon
				}}</v-icon>

				<span class="text-sm">{{ t(item.name) }}</span>

				<span
					v-if="item.type !== 'category' && item.keyBinding"
					class="opacity-40 ml-auto text-sm"
				>
					{{ item.keyBinding.toStrKeyCode() }}
				</span>
			</div>
			<!-- <v-menu>
				<template v-slot:activator="{ on }">
					<div></div>
					<v-list-item
						v-on="item.type === 'category' ? on : undefined"
						@click="onClick(item)"
						:disabled="item.isDisabled"
					>
						<v-list-item-icon v-if="item.icon">
							<v-icon color="accent" small>{{
								item.icon
							}}</v-icon>
						</v-list-item-icon>

						<v-list-item-content> </v-list-item-content>

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
			</v-menu> -->
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
