# packSpider

packSpider connects Minecraft's files. This data can be useful for a variety of different new features, including grouping files by feature instead of by file type.

## FileStructure

-   `connect`: Finds files whose cache keys match the specified criteria
-   `includeFiles`: Cache keys to directly include by name
-   `sharedFiles`: Static file paths to include in the feature group (e.g. blocks.json)
-   `includeFromFiles`: Include files by walking through a provided file. Path may include cacheKey
