import { ICreateProjectOptions } from "../../CreateProject";
import { CreateFile } from "../CreateFile";
import { FileSystem } from "/@/components/FileSystem/FileSystem";



export class CreateSplashes extends CreateFile {
    public readonly id = 'splashes'

    async create(fs: FileSystem, projectOptions: ICreateProjectOptions) {
        await fs.writeJSON(
            `RP/splashes.json`,
            {
                canMerge: false,
                splashes: []
            },
            true
        )
    }
}