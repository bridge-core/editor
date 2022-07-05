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
					setup:
						'deno install -A --reload -f -n dash_compiler https://deno.land/x/dash_compiler/mod.ts',
					watch:
						'dash_compiler build --mode development && dash_compiler watch',
					build: 'dash_compiler build',
				},
			},
			true
		)
	}
}
