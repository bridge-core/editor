<template>
	<v-card color="expanded_sidebar">
		<v-card-text>
			<p>
				{{
					$vuetify.lang.t(
						'$vuetify.sidebar.extensions.intro.description'
					)
				}}
			</p>
			<ul style="list-style: none;">
				<li>
					<v-icon color="accent" class="pr-1" small>
						mdi-palette
					</v-icon>
					<span>{{
						$vuetify.lang.t(
							'$vuetify.sidebar.extensions.intro.themes'
						)
					}}</span>
				</li>
				<li>
					<v-icon color="accent" class="pr-1" small>
						mdi-attachment
					</v-icon>
					<span>{{
						$vuetify.lang.t(
							'$vuetify.sidebar.extensions.intro.snippets'
						)
					}}</span>
				</li>
				<li>
					<v-icon color="accent" class="pr-1" small>
						mdi-text-box-multiple-outline
					</v-icon>
					<span>{{
						$vuetify.lang.t(
							'$vuetify.sidebar.extensions.intro.presets'
						)
					}}</span>
				</li>
				<li>
					<v-icon color="accent" class="pr-1" small>
						mdi-menu
					</v-icon>
					<span>{{
						$vuetify.lang.t(
							'$vuetify.sidebar.extensions.intro.uiElements'
						)
					}}</span>
				</li>
				<li>
					<v-icon color="accent" class="pr-1" small>
						mdi-format-list-bulleted-square
					</v-icon>
					<span>{{
						$vuetify.lang.t(
							'$vuetify.sidebar.extensions.intro.andMore'
						)
					}}</span>
				</li>
			</ul>
		</v-card-text>

		<v-card-actions style="display: grid; place-items: center;">
			<v-btn rounded dark color="primary" @click="openExtensionBrowser">
				<v-icon>mdi-puzzle</v-icon>
				<span>{{
					$vuetify.lang.t(
						'$vuetify.sidebar.extensions.intro.viewExtensions'
					)
				}}</span>
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
//import ExtensionBrowser from '../../../../../windows/Extensions/Browser'

export default {
	name: 'PluginIntro',
	methods: {
		openExtensionBrowser() {
			//new ExtensionBrowser()
		},
	},
}
</script>
