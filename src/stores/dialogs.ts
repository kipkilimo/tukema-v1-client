// src/stores/dialog.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export type DialogKey =
  | "artefact:create"
  | "artefact:edit"
  | "artefact:publish"
  | "artefact:archive"
  | "artefact:cover" // <-- NEW
  | "artefact:glb" // <-- NEW
  | "collection:create"
  | "gallery:create"
  | "exhibit:create"
  | "story:create"
  | "payment:issue-vouchers"
  | "payment:confirm"
  | "user:create"
  | "user:edit"
  | "user:deactivate"
  | "invite:user"
  | "settings:system";

export interface DialogPayload {
  id?: string;
  mode?: "create" | "edit";
  entity?: string;
  [key: string]: unknown;
}

export const useDialogStore = defineStore("dialog", () => {
  const openKey = ref<DialogKey | null>(null);
  const payload = ref<DialogPayload>({});

  function open(key: DialogKey, data: DialogPayload = {}) {
    openKey.value = key;
    payload.value = data;
  }

  function close() {
    openKey.value = null;
    payload.value = {};
  }

  function isOpen(key: DialogKey) {
    return openKey.value === key;
  }

  return { openKey, payload, open, close, isOpen };
});
