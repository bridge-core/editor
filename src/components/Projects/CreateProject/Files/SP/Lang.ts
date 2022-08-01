import { FileSystem } from "/@/components/FileSystem/FileSystem";
import { ICreateProjectOptions } from "/@/components/Projects/CreateProject/CreateProject";
import { TPackType } from "/@/components/Projects/CreateProject/Packs/Pack";
import { CreateFile } from "../CreateFile";

export class CreateLang extends CreateFile {
    public readonly id = 'lang'
    public isConfigurable = false

    constructor(protected packPath: TPackType) {
        super()
    }

    async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
        await fs.mkdir(`${this.packPath}/texts`)
        await fs.writeFile(
            `${this.packPath}/texts/en_US.lang`,
            createOptions.useLangForManifest
                ? ''
                : `skinpack.${createOptions.namespace}=${createOptions.name}`
        )
        await fs.writeJSON(
            `${this.packPath}/texts/languages.json`,
            ['en_US'],
            true
        )
    }
}