<!-- src/components/DialogContainer.vue -->
<template>
  <!-- 1. Main Artefact Form (Create / Edit) -->
  <ArtefactFormDialog
    v-if="dialog.isOpen('artefact:create') || dialog.isOpen('artefact:edit')"
    :model-value="true"
    :mode="dialog.isOpen('artefact:edit') ? 'edit' : 'create'"
    :artefact-id="dialog.payload.id"
    @update:model-value="close"
    @saved="onArtefactSaved"
  />

  <!-- 2. Cover Image Uploader -->
  <v-dialog
    v-if="dialog.isOpen('artefact:cover')"
    :model-value="true"
    max-width="600"
    persistent
    @update:model-value="close"
  >
    <CoverUploader
      :model-value="true"
      :artefact-id="dialog.payload.id"
      @update:model-value="close"
      @uploaded="close"
    />
  </v-dialog>

  <!-- 3. GLB Images Uploader (3D Views) -->
  <v-dialog
    v-if="dialog.isOpen('artefact:glb')"
    :model-value="true"
    max-width="900"
    persistent
    @update:model-value="close"
  >
    <GLBImagesUploader
      :model-value="true"
      :artefact-id="dialog.payload.id"
      @update:model-value="close"
      @uploaded="close"
    />
  </v-dialog>

  <!-- Add other dialogs (collection, gallery, etc.) here as you build them -->
</template>

<script setup lang="ts">
import { useDialogStore } from "@/stores/dialogs";

import ArtefactFormDialog from "@/components/dialogs/ArtefactFormDialog.vue";
import CoverUploader from "@/components/uploaders/CoverUploader.vue";
import GLBImagesUploader from "@/components/uploaders/GLBImagesUploader.vue";

const dialog = useDialogStore();

function close() {
  dialog.close();
}

/**
 * When a new artefact is created, immediately transition to the cover uploader.
 * This chains the workflow: create → add cover → process 3D (optional).
 */
function onArtefactSaved(payload: { id: string; created: boolean }) {
  if (payload.created && payload.id) {
    // Give Vue a tick to close the form dialog before opening the next one
    dialog.open("artefact:cover", { id: payload.id });
  } else {
    close();
  }
}
</script>
