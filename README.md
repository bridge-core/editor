# bridge. v2

<img alt="Version" src="https://img.shields.io/github/v/release/bridge-core/editor?style=flat&height=40&label=Version&message=Test&color=121212&labelColor=005bc9" height="20" > <img alt="License" src="https://img.shields.io/static/v1?style=flat&height=40&label=License&message=GPL-3.0&color=121212&labelColor=005bc9" height="20" > <a href="https://pr.new/github.com/bridge-core/editor/tree/dev" target="_blank">
<img alt="Open in Codeflow" src="https://developer.stackblitz.com/img/open_in_codeflow_small.svg" >
</a>

<a href="https://editor.bridge-core.app/">
    <img src="./public/img/social-preview.png">
</a>

This is the repository for bridge. v2, a powerful IDE for Minecraft Add-Ons.

## Installation

1. Visit https://editor.bridge-core.app/ with a supported browser. (We recommend the new Edge based on Chromium)
2. Click the install icon that appears inside of the URL bar.
   ![install](https://user-images.githubusercontent.com/33347616/126063371-5efd5c57-a8dc-4ac2-83ed-bed60fc44d93.png)
3. bridge. v2 is now installed to your system. You can continue with the guided setup process.

For more help on how to get started, please refer to our [getting started guide](https://bridge-core.app/editor-docs/getting-started/#setting-up-bridge).

## New App UI

bridge. v2 comes with a gorgeous redesign of all UI elements. This gives bridge. v2 a fresh new look and increases the usability of our UI.

### Pack Explorer

Our new pack explorer combines all pack types into a single, color-coded sidebar area.

![Bildschirmfoto 2021-07-18 um 11 02 39](https://user-images.githubusercontent.com/33347616/126061729-deb8f6d9-600c-4e8b-9a8a-707ef37135af.png)

---

### Creating Files

Presets are now at the front and center of creating files. Presets allow users to quickly create all files necessary to get a feature working in game. They are perfect for e.g. quickly setting up a new entity, block or item. You can also see that all window sidebars now have an updated look and all content windows now offer the ability to quickly search for things.

![Bildschirmfoto 2021-07-18 um 11 06 06](https://user-images.githubusercontent.com/33347616/126061807-c1015a5a-1f4d-4859-97ca-833fa727093e.png)

---

### Extension Store

Our new extension store also received a visual overhaul and some significant functionality changes to make it easier to keep extensions up to date, disabling/enabling installed extensions and exploring the catalogue.

![Bildschirmfoto 2021-07-18 um 11 11 14](https://user-images.githubusercontent.com/33347616/126061944-3d608d0f-dd4d-4b53-ba68-1b764b5df36d.png)

## Broader Bedrock Support

bridge. v2 now supports creating skin packs and world templates in addition to behavior and resource packs. We have also published an extension called "WorldHub" which allows creators to add multiple worlds to a project & pulling/pushing them from/to the com.mojang folder.

## Project Structure

bridge. v2 moves projects out of the com.mojang directory by default. Additionally, all packs that belong to a project can be found inside of a single folder. This allows for very easy integration with version control systems like git and makes it easier to work on the project with other editors. A typical v2 project looks like this:

```
-- My Project/
--- .bridge/
--- BP/
---- ...
---- manifest.json
--- RP/
---- ...
---- manifest.json
--- SP/
---- ...
---- manifest.json
--- config.json
```

## Compiler Architecture

Even though bridge. v2 no longer stores your project inside of the com.mojang folder, you still get the same seamless development experience if you have setup com.mojang syncing by dragging the folder onto bridge. v2. Upon making changes to the project folder, bridge. will re-compile the file and move it to Minecraft for testing. Because this process is fully automatic, **you should never manually work on the add-on inside of the com.mojang folder because any changes might get overwritten. Always work with the project folder!**

When you make changes to your project outside of bridge., you can refresh the project and bridge. will pick up any changes made with external editors and update the com.mojang output accordingly. This also works with file deletions & renames.

![Bildschirmfoto 2021-07-18 um 12 02 09](https://user-images.githubusercontent.com/33347616/126063144-656afc65-b3ab-424d-9188-124977bf3061.png)

Our compiler generally has two modes: "dev" and "build". The procedure described above always happens inside of "dev" mode. It is optimized for delivering fast & correct updates to all files that need to change whenever a source file inside of the dependency tree changes. The "build" mode compiles a full build that is ready for production inside of the "project/builds/dist/" folder. Some compiler plugins such as AnyLanguage are designed to only work inside of this compiler mode.

## Editing

bridge. v2 finally allows developers to freely switch between editing JSON files as text or in a dedicated tree editor that prevents newer users from making syntax mistakes. We also added a global find & replace system and live previews of files while your are working on them.

### Text Editor

We are using [Monaco](https://microsoft.github.io/monaco-editor/index.html) to provide the same incredible editing experience VS Code provides and we ship auto-completions & validations for all of Minecraft's JSON files.

![Bildschirmfoto 2021-07-18 um 11 17 33](https://user-images.githubusercontent.com/33347616/126062057-5ae6f5fb-0938-4828-89a3-b9df25b22f4a.png)

---

### Tree Editor

Our new tree editor features support for multiple selections, direct/more natural keybindings (e.g. "Del" instead of "Ctrl + Del") and makes use of the same new JSON schemas our text editor uses for its auto-completions. We are looking to add better (more Minecraft-y) syntax highlighting to both our text editor and tree editor in the future.

![Bildschirmfoto 2021-07-18 um 11 26 44](https://user-images.githubusercontent.com/33347616/126062278-329c6a3a-a727-4076-aeae-b60984f59ade.png)

---

### Live Previews

bridge. v2 ships with the ability to preview files while you edit them. This allows developers to find the perfect seat positions & collision/hit boxes without needing to jump into Minecraft. We support previewing particles, entities (components, models, particles & animations) and blocks (components & models).

![Bildschirmfoto 2021-07-18 um 11 21 42](https://user-images.githubusercontent.com/33347616/126062149-4975573c-ebf9-4baf-8510-d55a7d2db538.png)

---

### Global Find & Replace

This was one of the most requested features for bridge. v1. It proved to be technically difficult to implement previously because of the cache system that was in place for the old editor. With our new codebase, we were finally able to add a global find & replace system!

![Bildschirmfoto 2021-07-18 um 11 32 14](https://user-images.githubusercontent.com/33347616/126062374-c8ee8c2b-627d-4b94-bcaa-227099eaace8.png)

## Extensions

We are proud to already feature some fantastic new extensions on bridge. v2's extension store.

-   We have compiler plugins for automatically generating the "texture_list.json" file for production builds or automatically generating all lang files based on the "en_US.lang" file
-   A lot of themes are already available for bridge. v2
-   @aexer0e's fantastic "Compact Prettier" changes the default "format on save" formatter to produce more compact output
-   There are fantastic UI extensions such as @jasonjgardner's texture set generator, the MoLang Playground or @aexer0e's Table2 extension for displaying & editing Google Docs Tables inside of bridge.

![Bildschirmfoto 2021-07-18 um 11 36 11](https://user-images.githubusercontent.com/33347616/126062619-d870149d-edd4-40d6-83d8-7a34dc666e9d.png)

![Bildschirmfoto 2021-07-18 um 11 35 31](https://user-images.githubusercontent.com/33347616/126062615-8cd0b711-987c-4857-9890-8bb9b6608813.png)
