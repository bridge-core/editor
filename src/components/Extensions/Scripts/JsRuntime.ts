import { Runtime } from 'bridge-js-runtime'
import { App } from '/@/App'
import { dirname } from '/@/utils/path'

export class JsRuntime extends Runtime {
	async readFile(filePath: string) {
		const app = await App.getApp()

		const file = await app.fileSystem.readFile(filePath)
		const fileContent = await file.text()

		return fileContent
	}

	run(filePath: string, env: any = {}, fileContent?: string) {
		return super.run(
			filePath,
			Object.assign(env, {
				require: (x: string) => this.require(x, env, dirname(filePath)),
			}),
			fileContent
		)
	}
}
