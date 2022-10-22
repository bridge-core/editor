# Flow Editor

Rethinking Minecraft Add-On creation.

## What is Flow Editor?

Flow is an experimental visual entity editor for Minecraft Add-Ons. Components are placed on a grid and component groups and events are inferred naturally by the way the components are connected. This allows for a more intuitive and visual way to create Minecraft Add-Ons.

## Technical Details

### Internal Representation

Flow grids will have a fixed size of horizontal cells and a theoretically infinite number of vertical cells. We are storing components within an one-dimensional array of cells. Each cell can contain a single component or an "event line" to connect components together.

### Adding components

Components can be dragged from an "inventory" onto the grid. A component group is simply defined by having multiple components right next to each other. Events are connecting component groups together. A red line means "remove this group" and a green line means "add this group".

### Editing components

We need to write a small library which can turn a JSON schema into a simple, visual user interface. It will open upon clicking on a component in the grid.

### Turning flow into code

In order to turn the visual representation of an entity into code, we first need to create a data structure that stores all component groups. This is done in the following way:

-   Iterate over each cell line by line
    -   If the current cell is empty, jump to the next cell
    -   Otherwise, check if the cell above contains a component and the cell to the left contains a component
        -   If it does, merge the two components into one group and add the new component to the group as well
    -   If it doesn't, check if the cell above contains a component
        -   If it does, add the current component to the group above
    -   If it doesn't, check if the cell to the left contains a component
        -   If it does, add the current component to the group to the left
    -   Otherwise, add the current component to a new group

TODO: Event parsing
