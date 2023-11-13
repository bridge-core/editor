<template>
	<v-app
		ref="appContainer"
		:style="{ fontFamily }"
		@contextmenu.native="/*$event.preventDefault()*/"
	>
	</v-app>
</template>

<script>
export default {
	name: 'App',
}
</script>

<style>
/** Reset vuetify's scrolling */
html {
	overflow: hidden;
	overscroll-behavior: none;
}
body {
	overflow: unset;
	/** This terrible hack is needed to disable safari's overflow scrolling */
	position: fixed;
	width: 100%;
	height: 100vh;
	padding-left: env(safe-area-inset-left, 0);
}

/** Scrollbar */
*::-webkit-scrollbar {
	border-radius: 24px;
	width: 8px;
	height: 8px;
}
*::-webkit-scrollbar-track {
	border-radius: 24px;
}
*::-webkit-scrollbar-thumb {
	border-radius: 24px;
	background-color: var(--v-scrollbarThumb-base);
	border: thin solid rgba(0, 0, 0, 0.3);
	opacity: 0.8;
}

.theme--dark *::-webkit-scrollbar-thumb {
	border: thin solid rgba(255, 255, 255, 0.35);
}

summary::-webkit-details-marker {
	display: none;
}

/* No text selection */
:root {
	-moz-user-select: none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	user-select: none;
	touch-action: manipulation;
}
.text-normal {
	font-size: 1rem !important;
	font-weight: 400;
	letter-spacing: 0.03125em !important;
	line-height: 1.5rem;
}

.v-application {
	background: var(--v-background-base) !important;
}

.v-system-bar .v-icon {
	margin-right: 0;
}
.v-system-bar {
	width: calc(100% + 1px);
}

.v-select-list {
	background-color: var(--v-menu-base) !important;
}
.fill-area {
	width: 100%;
	height: 100%;
}
.code-font {
	font-family: Menlo, Monaco, 'Courier New', monospace;
}
.clickable {
	cursor: pointer;
	border-radius: 4px;
}
.cursor-pointer {
	cursor: pointer;
}
.no-pointer-events {
	pointer-events: none;
}
.outlined {
	border-width: thin;
	border-color: #555555;
	border-style: solid;
}
.theme--light .outlined {
	border-color: #a4a4a4;
}

input,
textarea {
	color: var(--v-text-base);
}

.suggest-details .header {
	font-size: unset !important;
	font-weight: unset !important;
	letter-spacing: unset !important;
	line-height: unset !important;
}

/* Properly center custom icons (e.g. blockbench) within lists  */
.v-list-item__icon {
	align-items: center;
}
</style>
