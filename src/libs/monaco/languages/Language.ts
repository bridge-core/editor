import { languages } from 'monaco-editor'

export const colorCodes = [
	[/§4[^§]*/, 'colorCode.darkRed'],
	[/§c[^§]*/, 'colorCode.red'],
	[/§6[^§]*/, 'colorCode.gold'],
	[/§e[^§]*/, 'colorCode.yellow'],
	[/§2[^§]*/, 'colorCode.darkGreen'],
	[/§a[^§]*/, 'colorCode.green'],
	[/§b[^§]*/, 'colorCode.aqua'],
	[/§3[^§]*/, 'colorCode.darkAqua'],
	[/§1[^§]*/, 'colorCode.darkBlue'],
	[/§9[^§]*/, 'colorCode.blue'],
	[/§d[^§]*/, 'colorCode.lightPurple'],
	[/§5[^§]*/, 'colorCode.darkPurple'],
	[/§f[^§]*/, 'colorCode.white'],
	[/§7[^§]*/, 'colorCode.gray'],
	[/§8[^§]*/, 'colorCode.darkGray'],
	[/§0[^§]*/, 'colorCode.black'],
	[/§g[^§]*/, 'colorCode.minecoinGold'],
	[/§o[^§]*/, 'colorCode.italic'],
	[/§l[^§]*/, 'colorCode.bold'],
	[/§n[^§]*/, 'colorCode.underline'],
] as languages.IMonarchLanguageRule[]
