<script lang="ts" setup>
import Window from "@/components/Windows/Window.vue";
import Icon from "@/components/Common/Icon.vue";
import Switch from "@/components/Common/Switch.vue";
import LabeledInput from "@/components/Common/LabeledInput.vue";
import InformativeToggle from "@/components/Common/InformativeToggle.vue";
import Expandable from "@/components/Common/Expandable.vue";
import Dropdown from "@/components/Common/Legacy/LegacyDropdown.vue";
import LabeledTextInput from "@/components/Common/LabeledTextInput.vue";
import TextButton from "@/components/Common/TextButton.vue";

import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { EditProjectWindow } from "./EditProjectWindow";
import { useTranslate } from "@/libs/locales/Locales";
import { Windows } from "../Windows";
import { useIsMobile } from "@/libs/Mobile";
import { ProjectInfo } from "@/libs/project/ProjectManager";

const t = useTranslate();
const { window } = defineProps<{ window: EditProjectWindow }>() as {
  window: EditProjectWindow;
};
const projectInfo: Ref<ProjectInfo> = window.projectInfo;
const projectName: Ref<string> = ref(projectInfo.config.name);
const projectDescription: Ref<string> = ref(projectInfo.config.description);
const projectNamespace: Ref<string> = ref(projectInfo.config.namespace);
const projectAuthor: Ref<string> = ref(projectInfo.config.author);
const projectTargetVersion: Ref<string> = ref(projectInfo.config.targetVersion);

const formatVersionDefinitions: Ref<FormatVersionDefinitions | null> = ref(null);
const isMobile = useIsMobile();

function validateProjectName(value: string): string | null {
  if (value === "") return "windows.editProject.name.mustNotBeEmpty";
  if (value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null)
    return "windows.editProject.name.invalidLetters";
  if (value.endsWith(".")) return "windows.editProject.name.endsInPeriod";

  return null;
}

function validateProjectNamespace(value: string): string | null {
  if (value.toLocaleLowerCase() !== value)
    return "windows.editProject.namespace.invalidCharacters";
  if (value.includes(" ")) return "windows.editProject.namespace.invalidCharacters";
  if (value.includes(":")) return "windows.editProject.namespace.invalidCharacters";
  if (value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null)
    return "windows.editProject.namespace.invalidCharacters";
  if (value === "") return "windows.editProject.namespace.mustNotBeEmpty";

  return null;
}

const validationError: ComputedRef<string | null> = computed(() => {
  if (projectName.value === "") return "windows.createProject.name.mustNotBeEmpty";
  if (projectName.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null)
    return "windows.createProject.name.invalidLetters";
  if (projectName.value.endsWith(".")) return "windows.createProject.name.endsInPeriod";

  if (projectNamespace.value.toLocaleLowerCase() !== projectNamespace.value)
    return "windows.createProject.namespace.invalidCharacters";
  if (projectNamespace.value.includes(" "))
    return "windows.createProject.namespace.invalidCharacters";
  if (projectNamespace.value.includes(":"))
    return "windows.createProject.namespace.invalidCharacters";
  if (projectNamespace.value.match(/"|\\|\/|:|\||<|>|\*|\?|~/g) !== null)
    return "windows.createProject.namespace.invalidCharacters";
  if (projectNamespace.value === "")
    return "windows.createProject.namespace.mustNotBeEmpty";

  return null;
});
</script>

<template>
  <Window :name="t('windows.editProject.title')" @close="Windows.close(window)">
    <div class="flex flex-col pb-8 grow" :class="{ 'h-[42.5rem] max-width': !isMobile }">
      <div class="overflow-auto p-4 pt-0 m-4 mt-2 basis-0 grow">
        <!-- Name -->
        <LabeledTextInput
          :label="t('windows.editProject.name.label')"
          class="h-min grow-[7]"
          v-model="projectName"
          :placeholder="t('windows.editProject.name.placeholder')"
          :rules="[validateProjectName]"
        />

        <!-- Description -->
        <LabeledTextInput
          :label="t('windows.editProject.description.label')"
          class="mb-4 flex-1 h-min"
          v-model="projectDescription"
          :placeholder="t('windows.editProject.description.placeholder')"
        />
        <div class="flex flex-wrap gap-x-4 mb-4">
          <!-- Namespace -->
          <LabeledTextInput
            :label="t('windows.editProject.namespace.label')"
            class="flex-1 h-min"
            v-model="projectNamespace"
            :placeholder="t('windows.editProject.namespace.placeholder')"
            :rules="[validateProjectNamespace]"
          />

          <!-- Author -->
          <LabeledTextInput
            :label="t('windows.editProject.author.label')"
            class="flex-1 h-min mb-5"
            v-model="projectAuthor"
            :placeholder="t('windows.editProject.author.placeholder')"
          />
        </div>

        <!-- Target Version -->
        <Dropdown class="flex-1">
          <template #main="{ expanded, toggle }">
            <LabeledInput
              :label="t('windows.editProject.targetVersion.label')"
              :focused="expanded"
              class="bg-background"
            >
              <div
                class="flex items-center justify-between cursor-pointer"
                @click="toggle"
              >
                <span class="font-theme">{{ projectTargetVersion }}</span>

                <Icon
                  icon="arrow_drop_down"
                  class="transition-transform duration-200 ease-out"
                  :class="{ '-rotate-180': expanded }"
                />
              </div>
            </LabeledInput>
          </template>

          <template #choices="{ collapse }">
            <div class="mt-2 bg-background-secondary w-full p-1 rounded">
              <div class="flex flex-col max-h-[6.5rem] overflow-y-auto p-1 light-scroll">
                <button
                  v-for="version in formatVersionDefinitions?.formatVersions
                    .slice()
                    .reverse()"
                  @click="
                    () => {
                      projectTargetVersion = version;
                      collapse();
                    }
                  "
                  class="hover:bg-primary text-start p-1 rounded transition-colors duration-100 ease-out font-theme"
                  :class="{
                    'bg-background-tertiary': projectTargetVersion === version,
                  }"
                >
                  {{ version }}
                </button>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>

      <div class="mx-8 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Icon v-if="validationError !== null" icon="error" class="text-sm text-error" />

          <p class="text-error font-theme text-xs h-min">
            {{ validationError !== null ? t(validationError) : "" }}
          </p>
        </div>

        <TextButton
          :text="t('Save')"
          @click="create"
          class="transition-[color, opacity]"
          :enabled="validationError === null"
        />
      </div>
    </div>
  </Window>
</template>
