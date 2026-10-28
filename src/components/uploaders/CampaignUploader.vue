<!-- client/src/components/uploaders/CampaignUploader.vue -->
<template>
  <v-card rounded="lg" class="campaign-uploader">
    <v-card-title class="d-flex align-center pa-4 bg-primary flex-shrink-0">
      <v-icon icon="mdi-image-edit-outline" size="26" class="mr-2" />
      <div class="flex-grow-1">
        <div class="text-subtitle-1 font-weight-bold">Campaign Poster</div>
        <div class="text-caption text-medium-emphasis">
          Crop to 1.62:1 — {{ OUTPUT_WIDTH }} × {{ OUTPUT_HEIGHT }} px
        </div>
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        :disabled="uploading"
        @click="close"
      />
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4 pa-md-6">
      <v-alert type="info" variant="tonal" density="compact" class="mb-4">
        Cropped poster will be attached to campaign
        <strong>{{ campaignId.slice(-8) }}</strong
        >.
      </v-alert>

      <div
        v-if="!previewUrl"
        class="drop-zone rounded-lg pa-5 text-center"
        :class="{ 'drop-zone--active': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="!uploading && fileInput?.click()"
      >
        <v-icon size="40" color="primary">mdi-cloud-upload-outline</v-icon>
        <div class="font-weight-medium mt-2">
          {{ originalFile?.name || "Drop a JPEG or PNG poster" }}
        </div>
        <div class="text-caption text-medium-emphasis mt-1">
          or click to browse · .jpg, .png · up to {{ maxSizeMB }} MB
        </div>
        <v-btn
          class="mt-3"
          color="primary"
          variant="tonal"
          size="small"
          :disabled="uploading"
          @click.stop="fileInput?.click()"
        >
          Choose poster
        </v-btn>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          class="d-none"
          @change="handleFileSelect"
        />
      </div>

      <v-alert
        v-if="fileError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ fileError }}
      </v-alert>

      <template v-if="previewUrl">
        <div class="crop-layout mt-2">
          <div>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2">Adjust crop</div>
              <v-chip size="x-small" color="primary" variant="tonal">
                1.62:1 locked
              </v-chip>
            </div>

            <div
              ref="stageEl"
              class="crop-stage"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <img
                ref="sourceImg"
                :src="previewUrl"
                class="crop-source"
                alt=""
                draggable="false"
                @load="onSourceLoaded"
              />
              <div class="crop-overlay" aria-hidden="true">
                <div class="crop-mask" :style="maskTopStyle" />
                <div class="crop-mask" :style="maskLeftStyle" />
                <div class="crop-mask" :style="maskRightStyle" />
                <div class="crop-mask" :style="maskBottomStyle" />
                <div
                  class="crop-rect"
                  :style="cropRectStyle"
                  @pointerdown.stop="onPointerDown"
                >
                  <span
                    v-for="h in HANDLES"
                    :key="h"
                    class="crop-handle"
                    :class="`crop-handle--${h}`"
                    @pointerdown.stop="(e) => onPointerDown(e, h)"
                  />
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap ga-2 mt-3">
              <v-btn
                variant="outlined"
                size="small"
                :disabled="!cropReady || uploading"
                @click="resetCrop"
              >
                Reset crop
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                color="error"
                :disabled="uploading"
                @click="clearImage"
              >
                Clear
              </v-btn>
            </div>
          </div>

          <div>
            <div class="text-subtitle-2 mb-2">Final preview</div>
            <div class="final-preview">
              <canvas ref="previewCanvas" />
            </div>
            <div class="text-caption text-medium-emphasis mt-2">
              Output: {{ OUTPUT_WIDTH }} × {{ OUTPUT_HEIGHT }} px ·
              {{ exportMime === "image/png" ? "PNG" : "JPEG" }}
            </div>
          </div>
        </div>

        <v-alert
          v-if="uploadError"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
          closable
          @click:close="uploadError = ''"
        >
          {{ uploadError }}
        </v-alert>

        <v-progress-linear
          v-if="uploading"
          indeterminate
          color="primary"
          class="mt-3"
          rounded
        />
      </template>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4">
      <v-btn variant="text" :disabled="uploading" @click="close">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-crop"
        :loading="uploading"
        :disabled="!cropReady || uploading"
        @click="cropAndUpload"
      >
        Crop &amp; Upload
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import axios from "axios";

const ASPECT_RATIO = 1.62;
const OUTPUT_WIDTH = 1620;
const OUTPUT_HEIGHT = 1000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);
const HANDLES = ["nw", "ne", "sw", "se"] as const;
type HandleKey = (typeof HANDLES)[number];

const props = withDefaults(
  defineProps<{
    campaignId: string;
    uploadUrl?: string;
    maxSizeMB?: number;
  }>(),
  {
    uploadUrl:
      (import.meta.env.VITE_API_URL || "http://localhost:4000") +
      "/api/campaigns/upload-poster",
    maxSizeMB: 10,
  },
);

const emit = defineEmits<{
  (e: "uploaded", data: { fileUrl: string; campaignId: string }): void;
  (e: "cancel"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const stageEl = ref<HTMLElement | null>(null);
const sourceImg = ref<HTMLImageElement | null>(null);
const previewCanvas = ref<HTMLCanvasElement | null>(null);

const originalFile = ref<File | null>(null);
const previewUrl = ref("");
const fileError = ref("");
const uploadError = ref("");
const uploading = ref(false);
const isDragOver = ref(false);

const natural = reactive({ w: 0, h: 0 });
const stage = reactive({ w: 0, h: 0 });
const crop = reactive({ x: 0, y: 0, w: 0, h: 0 });
let dragMode: "move" | "resize" | null = null;
let dragHandle: HandleKey | null = null;
let dragStart = { x: 0, y: 0 };
let dragCrop = { x: 0, y: 0, w: 0, h: 0 };

const cropReady = computed(() => natural.w > 0 && crop.w > 0);
const exportMime = computed<"image/jpeg" | "image/png">(() =>
  originalFile.value?.type === "image/png" ? "image/png" : "image/jpeg",
);

const pctX = (x: number) => (stage.w ? `${(x / stage.w) * 100}%` : "0%");
const pctY = (y: number) => (stage.h ? `${(y / stage.h) * 100}%` : "0%");
const maskTopStyle = computed(() => ({
  left: "0%",
  right: "0%",
  top: "0%",
  height: pctY(crop.y),
}));
const maskLeftStyle = computed(() => ({
  left: "0%",
  top: pctY(crop.y),
  width: pctX(crop.x),
  height: pctY(crop.h),
}));
const maskRightStyle = computed(() => ({
  left: pctX(crop.x + crop.w),
  top: pctY(crop.y),
  right: "0%",
  height: pctY(crop.h),
}));
const maskBottomStyle = computed(() => ({
  left: "0%",
  right: "0%",
  top: pctY(crop.y + crop.h),
  bottom: "0%",
}));
const cropRectStyle = computed(() => ({
  left: pctX(crop.x),
  top: pctY(crop.y),
  width: pctX(crop.w),
  height: pctY(crop.h),
}));

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (f) setFile(f);
  input.value = "";
}
function handleDrop(e: DragEvent) {
  isDragOver.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) setFile(f);
}
function setFile(f: File) {
  if (!ALLOWED_MIME.has(f.type)) {
    fileError.value = "Only JPEG or PNG images are allowed.";
    return;
  }
  if (f.size > props.maxSizeMB * 1024 * 1024) {
    fileError.value = `Max size ${props.maxSizeMB} MB.`;
    return;
  }
  fileError.value = "";
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  originalFile.value = f;
  previewUrl.value = URL.createObjectURL(f);
}
function clearImage() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  originalFile.value = null;
  previewUrl.value = "";
  fileError.value = "";
  uploadError.value = "";
  natural.w = natural.h = 0;
  stage.w = stage.h = 0;
  crop.x = crop.y = crop.w = crop.h = 0;
}

function onSourceLoaded() {
  const img = sourceImg.value;
  const box = stageEl.value;
  if (!img || !box) return;
  natural.w = img.naturalWidth;
  natural.h = img.naturalHeight;
  const r = box.getBoundingClientRect();
  stage.w = r.width;
  stage.h = r.height;
  resetCrop();
}
function resetCrop() {
  if (!stage.w || !stage.h) return;
  const maxW = stage.w;
  const maxH = maxW / ASPECT_RATIO;
  const h = Math.min(stage.h, maxH);
  const w = h * ASPECT_RATIO;
  crop.x = (stage.w - w) / 2;
  crop.y = (stage.h - h) / 2;
  crop.w = w;
  crop.h = h;
  drawPreview();
}
function onPointerDown(e: PointerEvent, handle?: HandleKey) {
  if (!cropReady.value) return;
  dragMode = handle ? "resize" : "move";
  dragHandle = handle ?? null;
  dragStart = { x: e.clientX, y: e.clientY };
  dragCrop = { ...crop };
  (e.target as Element).setPointerCapture?.(e.pointerId);
}
function onPointerMove(e: PointerEvent) {
  if (!dragMode) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  if (dragMode === "move") {
    crop.x = clamp(dragCrop.x + dx, 0, stage.w - crop.w);
    crop.y = clamp(dragCrop.y + dy, 0, stage.h - crop.h);
  } else if (dragHandle) {
    const MIN = 60;
    const isLeft = dragHandle.includes("w");
    const isRight = dragHandle.includes("e");
    const isTop = dragHandle.includes("n");
    const isBottom = dragHandle.includes("s");
    let newW = dragCrop.w + (isRight ? dx : isLeft ? -dx : 0);
    if (isTop || isBottom) {
      const fromH = (dragCrop.h + (isBottom ? dy : -dy)) * ASPECT_RATIO;
      newW = Math.max(newW, fromH);
    }
    newW = clamp(newW, MIN, stage.w);
    let newH = newW / ASPECT_RATIO;
    if (newH > stage.h) {
      newH = stage.h;
      newW = newH * ASPECT_RATIO;
    }
    let nx = dragCrop.x;
    let ny = dragCrop.y;
    if (isRight) nx = dragCrop.x + dragCrop.w - newW;
    if (isBottom) ny = dragCrop.y + dragCrop.h - newH;
    if (isLeft) nx = dragCrop.x + (dragCrop.w - newW);
    crop.x = clamp(nx, 0, stage.w - newW);
    crop.y = clamp(ny, 0, stage.h - newH);
    crop.w = newW;
    crop.h = newH;
  }
  drawPreview();
}
function onPointerUp(e: PointerEvent) {
  dragMode = null;
  dragHandle = null;
  (e.target as Element).releasePointerCapture?.(e.pointerId);
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function renderCropCanvas(): HTMLCanvasElement | null {
  const img = sourceImg.value;
  if (!img) return null;
  const scaleX = natural.w / stage.w;
  const scaleY = natural.h / stage.h;
  const sx = crop.x * scaleX;
  const sy = crop.y * scaleY;
  const sw = crop.w * scaleX;
  const sh = crop.h * scaleY;

  const out = document.createElement("canvas");
  out.width = OUTPUT_WIDTH;
  out.height = OUTPUT_HEIGHT;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  return out;
}
function drawPreview() {
  const canvas = previewCanvas.value;
  if (!canvas || !cropReady.value) return;
  const src = renderCropCanvas();
  if (!src) return;
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  canvas.getContext("2d")?.drawImage(src, 0, 0, canvas.width, canvas.height);
}

async function buildCroppedFile(): Promise<File> {
  const canvas = renderCropCanvas();
  if (!canvas) throw new Error("Crop render failed.");
  const mime = exportMime.value;
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, mime, mime === "image/jpeg" ? 0.94 : undefined),
  );
  if (!blob) throw new Error("Encode failed.");
  const base = (originalFile.value?.name ?? "poster").replace(/\.[^.]+$/, "");
  return new File(
    [blob],
    `${base}-poster.${mime === "image/png" ? "png" : "jpg"}`,
    {
      type: mime,
      lastModified: Date.now(),
    },
  );
}

async function cropAndUpload() {
  if (!cropReady.value || uploading.value) return;
  uploading.value = true;
  uploadError.value = "";
  try {
    const file = await buildCroppedFile();
    const form = new FormData();
    form.append("file", file);
    form.append("campaignId", props.campaignId);
    form.append("width", String(OUTPUT_WIDTH));
    form.append("height", String(OUTPUT_HEIGHT));

    const { data } = await axios.post(props.uploadUrl, form, {
      withCredentials: true,
    });

    if (!data?.success) {
      throw new Error(data?.error || "Upload failed");
    }
    const fileUrl = data?.data?.fileUrl ?? data?.fileUrl ?? "";
    emit("uploaded", { fileUrl, campaignId: props.campaignId });
  } catch (err: any) {
    uploadError.value =
      err?.response?.data?.error || err?.message || "Failed to upload poster.";
  } finally {
    uploading.value = false;
  }
}

function close() {
  if (uploading.value) return;
  emit("cancel");
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}
.drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}

.crop-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
}
.crop-stage {
  position: relative;
  width: 100%;
  min-height: 220px;
  max-height: 420px;
  overflow: hidden;
  background: #0d0f12;
  border-radius: 8px;
  touch-action: none;
  user-select: none;
}
.crop-source {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}
.crop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.crop-mask {
  position: absolute;
  background: rgba(0, 0, 0, 0.55);
}
.crop-rect {
  position: absolute;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
  cursor: move;
  box-sizing: border-box;
}
.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 1px solid #3d8361;
  border-radius: 2px;
}
.crop-handle--nw {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}
.crop-handle--ne {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}
.crop-handle--sw {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}
.crop-handle--se {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}

.final-preview {
  width: 100%;
  aspect-ratio: 1.62;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
.final-preview canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 700px) {
  .crop-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
