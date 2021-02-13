# Proposal: Lightning Cache v2

Due to our move to standardize JSON schemas, the new lightning cache needs to...
a) Parse JSON files and grab the defined data
b) Transform the data into a JSON schema

This process should generate two files: One for data of the current file and one for all data related to the corresponding file type.

## Generated file structure

Main lightning cache storage: `schema/dynamic/`
Please note that this path refers to the actual local save path of bridge.'s schemas. We obviously cannot distribute the actual generated schemas over this repository because they need to be created dynamically.

-   `currentFile.json` saves data related to the current file
-   `[fileType]/[cacheKey]Enum.json` saves data related to \[cacheKey\] as enums
-   `[fileType]/[cacheKey]Properties.json` saves data related to \[cacheKey\] as properties

## General lightning cache JSON format

-   `Record<CacheKey, CacheDef>[]`
-   `type CacheKey = string`
-   `type CacheDef = string | string[]`
