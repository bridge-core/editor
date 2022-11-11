import { Ref, ref, watch, onUnmounted, nextTick, watchEffect } from 'vue'
import { Project } from '../Projects/Project/Project'
import { App } from '/@/App'
import { IDisposable } from '/@/types/disposable'

export function useProject() {
	const project = <Ref<Project | null>>ref(null)
	let disposable: IDisposable | null = null

	App.getApp().then(async (app) => {
		await app.projectManager.projectReady.fired
		project.value = app.project

		disposable = App.eventSystem.on('projectChanged', (newProject) => {
			project.value = newProject
		})
	})

	onUnmounted(() => {
		disposable?.dispose()
		disposable = null
	})

	return {
		project,
	}
}
