<template>
	<details>
		<summary>{{ directoryEntry.name }}</summary>

		<template v-for="entry in directoryEntry.children">
			<Folder
				v-if="!entry.isFile"
				:key="entry.uuid"
				:directoryEntry="entry"
			/>
		</template>
	</details>
</template>

<script>
export default {
	name: 'Folder',
	props: {
		directoryEntry: Object,
	},
}
</script>

<style></style>
