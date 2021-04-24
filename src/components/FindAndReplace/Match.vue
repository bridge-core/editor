<template>
	<div class="code-font code-match" style="width: 100%; overflow-x: hidden">
		<span>{{ item.isStartOfFile ? '' : '...' }}{{ item.beforeMatch }}</span>
		<span
			:class="{
				'error--text text-decoration-line-through': replaceWith,
				'success--text': !replaceWith,
			}"
			>{{ item.match }}</span
		>
		<span v-if="replaceWith" class="success--text">{{ replaceWith }}</span>
		<span>{{ item.afterMatch }}...</span>
	</div>
</template>

<script>
export default {
	name: 'Match',
	props: {
		replaceWith: String,
		item: Object,
	},
}
</script>
