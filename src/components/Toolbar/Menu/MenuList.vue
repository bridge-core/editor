<template>
	<!-- "tile" prop doesn't work on nested lists -> set border radius directly -->
	<v-list class="app-menu" style="border-radius: 0;">
		<v-menu
			v-for="(item, key, i) in elements"
			:key="`menu.${i}.${Math.random()}`"
			open-on-hover
			offset-x
			tile
			z-index="11"
		>
			<template v-slot:activator="{ on }">
				<v-list-item
					dense
					v-on="item.type === 'category' ? on : undefined"
					@click="() => item.trigger()"
				>
					<v-list-item-icon v-if="item.icon">
						<v-icon color="accent" small>{{ item.icon }}</v-icon>
					</v-list-item-icon>

					<v-list-item-content>
						<v-list-item-title>{{
							t(item.name)
						}}</v-list-item-title>
					</v-list-item-content>

					<v-list-item-action>
						<v-list-item-action-text>
							<span
								v-if="
									item.type !== 'category' && item.keyBinding
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
	</v-list>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'MenuList',
	mixins: [TranslationMixin],
	props: {
		elements: Object,
	},

	methods: {
		clickHandler(onClick) {
			if (onClick) onClick()
			this.$root.$emit('bridge:closeAllAppMenus')
		},
	},
}
</script>
