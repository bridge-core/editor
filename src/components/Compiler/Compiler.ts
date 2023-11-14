import type { DashService } from './Worker/Service'
import CompilerWorker from './Worker/Service?worker'
import { wrap } from 'comlink'
import { setupWorker } from '/@/libs/worker/setup'

const worker = new CompilerWorker()
export const DashCompiler = wrap<typeof DashService>(worker)

setupWorker(worker)
