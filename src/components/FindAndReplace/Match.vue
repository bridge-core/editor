<template>
	<div class="code-font code-match" style="width: 100%; overflow-x: hidden">
		<span>{{ item.isStartOfFile ? '' : '...' }}{{ item.beforeMatch }}</span>
		<span
			:class="{
				'error--text text-decoration-line-through': showReplaceWith,
				'success--text': !showReplaceWith,
			}"
			>{{ item.match }}</span
		>
		<span v-if="showReplaceWith" class="success--text">{{
			replaceWith
		}}</span>
		<span>{{ item.afterMatch }}...</span>
	</div>
</template>

<script>
export default {
	name: 'Match',
	props: {
		replaceWith: String,
		showReplaceWith: Boolean,
		item: Object,
	},
}
</script>
