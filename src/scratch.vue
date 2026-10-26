
<template>
  <v-container>
    {{ resourceStore.resource }}
    <v-container>
      <VContainer>
        <VuetifyTiptap
          v-model="content"
          :label="resourceStore.resource.title"
          rounded
          min-height="54vh"
          max-height="54vh"
          max-width="95%"
          :extensions="extensions"
        />
        <v-card-actions>
          <v-btn variant="outlined" @click="saveArticle">
            <v-icon class="mr-2">mdi-content-save-edit</v-icon>SAVE ARTICLE
          </v-btn>
        </v-card-actions>
        <VuetifyViewer :value="content" />
      </VContainer>
    </v-container>
    <v-dialog v-model="metaDialog" max-width="600">
      <v-card
        prepend-icon="mdi-edit-not-outline"
        title="Choose programming language"
      >
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                :items="['R', 'Python', 'STATA']"
                density="compact"
                v-model="language"
                label="Select Programming Language"
              ></v-select>
            </v-col>
          </v-row>

          <small class="text-caption text-medium-emphasis"
            >*indicates required field</small
          >
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="metaDialog = false">
            <v-icon class="mr-2">mdi-code</v-icon>SAVE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { ref, watch } from "vue";
import { useResourceStore } from "@/stores/resources";
const resourceStore = useResourceStore();
const metaDialog = ref(true);
const language = ref("");
import {
  BaseKit,
  Bold,
  Color,
  Fullscreen,
  Heading,
  Highlight,
  History,
  Image,
  Italic,
  Link,
  Strike,
  Table,
  Underline,
  Video,
  VuetifyTiptap,
  VuetifyViewer,
} from "vuetify-pro-tiptap";
import "vuetify-pro-tiptap/style.css";

const content = ref("");

const extensions = [
  BaseKit.configure({
    placeholder: {
      placeholder: "Enter some text...",
    },
  }),
  BaseKit,
  Bold,
  Italic,
  Underline,
  Strike,
  Color,
  Highlight,
  Heading,
  TextAlign,
  FontFamily,
  FontSize,
  SubAndSuperScript,
  BulletList,
  OrderedList,
  TaskList,
  Indent,
  Link,
  MarkdownTheme,
  Image,
  Video,
  Table,
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,
  Clear,
  Fullscreen,
  History,
];

const saveArticle = async () => {
  const paramsObjRaw = [
    {
      resourceId: resourceStore.resource.id,
      resourceContent: content.value, // Use the reactive reference here
      topic: localStorage.getItem("articleTopic"),
      language: language.value,
    },
  ];
  console.log({ paramsObjRaw });

  const resourceDetails = JSON.stringify(paramsObjRaw);
  await resourceStore.addResourceFormContent({ resourceDetails });
  window.location.reload();
};
</script>
