import { computed, ref } from 'vue'
import { useProject } from './UseProject'

export function useTabSystem(tabSystemId = ref(0)) {
	const { project } = useProject()
	const tabSystem = computed(
		() => project.value?.tabSystems[tabSystemId.value]
	)
	const activeTabSystem = computed(() => project.value?.tabSystem)
	const tabSystems = computed(() => project.value?.tabSystems)
	const shouldRenderWelcomeScreen = computed(() => {
		return (
			tabSystems.value &&
			(tabSystems.value?.[0].shouldRender.value ||
				tabSystems.value?.[1].shouldRender.value)
		)
	})

	return {
		tabSystem,
		activeTabSystem,
		tabSystems,
		shouldRenderWelcomeScreen,
	}
}
