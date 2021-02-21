import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateSkins extends CreateFile {
    constructor(protected pack: TPackType) {
        super()
    }

    create(fs: FileSystem, createOptions: ICreateProjectOptions) {
        return fs.writeJSON(
            `${this.pack}/skins.json`,
            {
                geometry: 'skinpacks/skins.json',
                skins: [
                    
                ],
                serialize_name: createOptions.prefix,
                localization_name: createOptions.prefix
            },
            true
        )
    }
}