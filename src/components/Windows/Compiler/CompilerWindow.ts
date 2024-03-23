import { Window } from '../Window'
import Compiler from './Compiler.vue'

export class CompilerWindow extends Window {
	public static id = 'compiler'
	public static component = Compiler
}
