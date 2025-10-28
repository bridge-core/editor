import { Settings } from '@/libs/settings/Settings'
import { Window } from '../Window'
import EditProject from './EditProject.vue'
import { ProjectInfo, ProjectManager } from '@/libs/project/ProjectManager'
import { basename, join } from 'pathe'

export class EditProjectWindow extends Window {
    public static id = 'editProject'
    public component = EditProject

    constructor(public projectInfo: ProjectInfo) {
        super()
    }
}