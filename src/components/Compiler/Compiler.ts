import type { DashService, ICompilerOptions } from './Worker/Service'
import CompilerWorker from './Worker/Service?worker'
import { wrap } from 'comlink'

const worker = new CompilerWorker()
export const DashCompiler = wrap<typeof DashService>(worker)
