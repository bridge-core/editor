<template>
	<div class="d-flex align-center mb-2">
		<template v-if="selected">
			<v-icon color="success" class="mr-1" small>
				mdi-checkbox-marked-circle-outline
			</v-icon>
			<span>
				{{ t('general.active') }}
			</span>
		</template>
		<template v-else>
			<v-icon class="mr-1" small>
				mdi-checkbox-blank-circle-outline
			</v-icon>
			<span>
				{{ t('general.inactive') }}
			</span>
		</template>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	name: 'SelectedStatus',
	mixins: [TranslationMixin],
	props: {
		selected: {
			type: Boolean,
			required: true,
		},
	},
}
</script>
