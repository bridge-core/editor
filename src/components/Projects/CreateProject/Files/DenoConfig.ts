import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from './CreateFile'

export class CreateDenoConfig extends CreateFile {
	public readonly id = 'denoConfig'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`deno.json`,
			{
				tasks: {
					install_dash:
						'deno install -A --reload -f -n dash_compiler https://raw.githubusercontent.com/bridge-core/deno-dash-compiler/main/mod.ts',
					watch: 'dash_compiler build --mode development && dash_compiler watch',
					build: 'dash_compiler build',
				},
			},
			true
		)
	}
}
