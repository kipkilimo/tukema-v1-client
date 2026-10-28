<!-- views/MuseumExplorer.vue -->
<template>
  <v-layout class="explorer" :class="{ 'explorer--compact': !isDesktop }">
    <!-- ============ VOUCHER: validating dialog ============ -->
    <v-dialog
      :model-value="validating"
      persistent
      width="auto"
      scrim="black"
      z-index="3000"
    >
      <v-card class="pa-6 d-flex flex-column align-center" min-width="240">
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
          class="mb-3"
        />
        <div class="text-body-1">Validating your ticket…</div>
      </v-card>
    </v-dialog>

    <!-- ============ VOUCHER: purchase dialog (hard gate / add time) ============ -->
    <VoucherPurchaseDialog
      :model-value="locked || buyOpen"
      :persistent="locked"
      :token="locked ? (voucherStore.code ?? undefined) : undefined"
      :message="locked ? (voucherStore.error ?? undefined) : undefined"
      :reason="locked ? (voucherStore.error ?? undefined) : undefined"
      @update:model-value="buyOpen = $event"
      @payment-success="onPurchaseSuccess"
    />

    <!-- ============ Notices (time warnings, snapshots) ============ -->
    <v-snackbar
      v-model="notice.show"
      :color="notice.color"
      location="top"
      :timeout="6000"
      z-index="3100"
    >
      {{ notice.text }}
      <template #actions>
        <v-btn
          v-if="notice.action"
          variant="text"
          @click="
            notice.show = false;
            openBuyMore();
          "
        >
          Add time
        </v-btn>
        <v-btn variant="text" @click="notice.show = false">OK</v-btn>
      </template>
    </v-snackbar>

    <!-- ============================================================== -->
    <!-- APP BAR                                                         -->
    <!-- ============================================================== -->
    <v-app-bar density="comfortable" flat border="b">
      <v-tooltip text="Back to dashboard" location="bottom">
        <template #activator="{ props: tip }">
          <v-btn
            v-bind="tip"
            icon="mdi-arrow-left"
            to="/dashboard"
            aria-label="Back to dashboard"
          />
        </template>
      </v-tooltip>

      <v-app-bar-title class="font-weight-bold">
        Museum
        <span
          v-if="totalCount"
          class="text-caption text-medium-emphasis font-weight-regular ml-2 d-none d-sm-inline"
        >
          {{ totalCount }} artefacts
        </span>
      </v-app-bar-title>

      <!-- Time left -->
      <v-menu
        v-if="accessGranted"
        location="bottom end"
        :close-on-content-click="false"
      >
        <template #activator="{ props: menuProps }">
          <v-tooltip location="bottom" :text="timeTooltip">
            <template #activator="{ props: tipProps }">
              <v-btn
                v-bind="mergeProps(menuProps, tipProps)"
                variant="tonal"
                rounded="pill"
                :color="timeColor"
                class="text-none px-2 mr-1"
                aria-label="Time left — open details"
              >
                <v-progress-circular
                  :model-value="timePercent"
                  :color="timeColor"
                  size="26"
                  width="3"
                  class="mr-2"
                >
                  <v-icon size="12">{{ countdownIcon }}</v-icon>
                </v-progress-circular>
                <span
                  class="tabular font-weight-bold"
                  :class="{ pulse: isFinalCountdown }"
                >
                  {{ countdownText || "—" }}
                </span>
              </v-btn>
            </template>
          </v-tooltip>
        </template>

        <v-card min-width="280" max-width="320">
          <v-card-title class="d-flex align-center ga-2 text-subtitle-1">
            <v-icon :color="timeColor">mdi-timer-outline</v-icon>
            Your access time
          </v-card-title>
          <v-card-text>
            <div
              class="text-h4 font-weight-bold tabular"
              :class="`text-${timeColor}`"
            >
              {{ countdownText || "—" }}
            </div>
            <div class="text-caption text-medium-emphasis mb-3">
              {{ timeStatusText }}
            </div>
            <v-progress-linear
              :model-value="timePercent"
              :color="timeColor"
              height="8"
              rounded
            />
            <v-list density="compact" class="px-0 mt-2" lines="one">
              <v-list-item
                prepend-icon="mdi-ticket-confirmation-outline"
                title="Ticket"
                :subtitle="voucherStore.code ?? '—'"
              />
              <v-list-item
                v-if="expiresText"
                prepend-icon="mdi-clock-end"
                title="Ends at"
                :subtitle="expiresText"
              />
              <v-list-item
                prepend-icon="mdi-volume-high"
                title="Countdown sound"
                :subtitle="
                  prefersReducedMotion ? 'Off (reduced motion)' : undefined
                "
              >
                <template #append>
                  <v-switch
                    :model-value="!muted"
                    color="primary"
                    density="compact"
                    hide-details
                    :disabled="prefersReducedMotion"
                    @update:model-value="toggleMute"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn
              block
              variant="flat"
              color="primary"
              prepend-icon="mdi-plus-circle-outline"
              @click="openBuyMore"
            >
              Add more time
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-tooltip text="Search & browse" location="bottom">
        <template #activator="{ props: tip }">
          <v-btn
            v-bind="tip"
            icon="mdi-magnify"
            class="d-md-none"
            aria-label="Search and browse categories"
            @click="openSearch"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        :text="cartIds.size ? `Cart (${cartIds.size})` : 'Cart is empty'"
        location="bottom"
      >
        <template #activator="{ props: tip }">
          <v-btn v-bind="tip" icon aria-label="Open cart" @click="goCheckout">
            <v-badge
              :model-value="cartIds.size > 0"
              :content="cartIds.size"
              color="primary"
            >
              <v-icon>mdi-cart-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
      </v-tooltip>
    </v-app-bar>

    <!-- ============================================================== -->
    <!-- CATEGORY EXPLORER (permanent on md+, slide-over on phones)      -->
    <!-- ============================================================== -->
    <v-navigation-drawer
      :model-value="isDesktop || catDrawer"
      :permanent="isDesktop"
      :temporary="!isDesktop"
      location="start"
      :width="320"
      @update:model-value="catDrawer = $event"
    >
      <div class="pa-3 pb-1">
        <div class="d-flex align-center mb-2">
          <span class="text-overline">Explore</span>
          <v-spacer />
          <v-btn
            v-if="!isDesktop"
            icon="mdi-close"
            size="small"
            variant="text"
            aria-label="Close"
            @click="catDrawer = false"
          />
        </div>
        <v-text-field
          ref="searchField"
          :model-value="searchText"
          density="comfortable"
          variant="solo-filled"
          flat
          hide-details
          clearable
          rounded="lg"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search artefacts"
          @update:model-value="onSearchChanged"
          @click:clear="onSearchChanged('')"
        />
      </div>

      <div
        v-if="hasFilters"
        class="px-3 pb-2 d-flex flex-wrap ga-1 align-center"
      >
        <v-chip
          v-if="activeCategory !== ALL"
          size="small"
          closable
          color="primary"
          variant="tonal"
          @click:close="setCategory(ALL)"
        >
          {{ store.categoryLabel(activeCategory) }}
        </v-chip>
        <v-chip
          v-if="activeSub"
          size="small"
          closable
          color="primary"
          variant="tonal"
          @click:close="setSub(null)"
        >
          {{ store.subcategoryLabel(activeCategory, activeSub) }}
        </v-chip>
        <v-chip
          v-if="searchText.trim()"
          size="small"
          closable
          variant="tonal"
          @click:close="onSearchChanged('')"
        >
          “{{ searchText.trim() }}”
        </v-chip>
        <v-btn variant="text" size="x-small" @click="resetFilters">
          Clear all
        </v-btn>
      </div>

      <v-divider />

      <v-list v-model:opened="openGroups" nav density="comfortable">
        <v-list-item
          prepend-icon="mdi-view-grid-outline"
          title="All artefacts"
          :active="activeCategory === ALL"
          color="primary"
          rounded="lg"
          @click="setCategory(ALL)"
        >
          <template v-if="activeCategory === ALL && totalCount" #append>
            <v-chip size="x-small" variant="tonal">{{ totalCount }}</v-chip>
          </template>
        </v-list-item>

        <template v-for="c in store.categories" :key="c.slug">
          <v-list-group
            v-if="store.subcategoriesOf(c.slug).length"
            :value="c.slug"
          >
            <template #activator="{ props: gp }">
              <v-list-item
                v-bind="gp"
                :prepend-icon="categoryIcon(c)"
                :title="c.label"
                :active="activeCategory === c.slug && !activeSub"
                color="primary"
                rounded="lg"
                @click="setCategory(c.slug)"
              />
            </template>
            <v-list-item
              v-for="s in store.subcategoriesOf(c.slug)"
              :key="s.slug"
              :title="s.label"
              :active="activeCategory === c.slug && activeSub === s.slug"
              color="primary"
              rounded="lg"
              @click="pickSub(c.slug, s.slug)"
            />
          </v-list-group>

          <v-list-item
            v-else
            :prepend-icon="categoryIcon(c)"
            :title="c.label"
            :active="activeCategory === c.slug"
            color="primary"
            rounded="lg"
            @click="setCategory(c.slug)"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- ============================================================== -->
    <!-- ARTEFACT DETAILS (permanent on lg+, slide-over below)           -->
    <!-- ============================================================== -->
    <v-navigation-drawer
      :model-value="isWide || detailsOpen"
      :permanent="isWide"
      :temporary="!isWide"
      location="end"
      :width="isWide ? 380 : 340"
      @update:model-value="detailsOpen = $event"
    >
      <div v-if="selectedId" class="pa-4">
        <div class="d-flex align-start ga-2">
          <div class="text-body-2 text-medium-emphasis flex-grow-1">
            {{ categoryText }}
          </div>
          <v-btn
            v-if="!isWide"
            icon="mdi-close"
            size="small"
            variant="text"
            aria-label="Close details"
            @click="detailsOpen = false"
          />
        </div>
        <h1 class="text-h5 my-1">{{ title }}</h1>
        <div v-if="priceText" class="text-h6 text-primary mb-3">
          {{ priceText }}
        </div>

        <template v-if="artefact">
          <p class="explorer__desc mb-4">{{ artefact.description }}</p>
          <v-divider class="mb-2" />
          <v-list density="compact" class="px-0" lines="one">
            <v-list-item
              v-if="artefact.region"
              prepend-icon="mdi-map-marker-outline"
              title="Region"
              :subtitle="artefact.region"
            />
            <v-list-item
              prepend-icon="mdi-update"
              title="Updated"
              :subtitle="updatedText"
            />
          </v-list>
          <template v-if="artefact.communities.length">
            <div class="text-overline mt-2">Communities</div>
            <div class="d-flex flex-wrap ga-1">
              <v-chip v-for="c in artefact.communities" :key="c" size="small">
                {{ c }}
              </v-chip>
            </div>
          </template>
          <template v-if="artefact.tags.length">
            <div class="text-overline mt-3">Tags</div>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="t in artefact.tags"
                :key="t"
                size="small"
                variant="outlined"
              >
                {{ t }}
              </v-chip>
            </div>
          </template>
        </template>
        <v-skeleton-loader v-else type="paragraph, chip, paragraph" />
      </div>
      <div v-else class="pa-6 text-medium-emphasis">
        Select an artefact to see its story, origin and price.
      </div>
    </v-navigation-drawer>

    <!-- ============================================================== -->
    <!-- MAIN                                                            -->
    <!-- ============================================================== -->
    <v-main class="explorer__main">
      <div class="explorer__col">
        <!-- Time-left bar -->
        <v-progress-linear
          v-if="accessGranted"
          :model-value="timePercent"
          :color="timeColor"
          height="4"
          class="flex-grow-0"
          aria-label="Time left"
        />

        <!-- Quick category chips (phones / tablets) -->
        <div v-if="!isDesktop" class="px-2 pt-2 flex-grow-0">
          <v-slide-group show-arrows="never" class="mb-1">
            <v-slide-group-item>
              <v-chip
                class="mr-2"
                :color="activeCategory === ALL ? 'primary' : undefined"
                :variant="activeCategory === ALL ? 'flat' : 'tonal'"
                @click="setCategory(ALL)"
              >
                All
              </v-chip>
            </v-slide-group-item>
            <v-slide-group-item v-for="c in store.categories" :key="c.slug">
              <v-chip
                class="mr-2"
                :prepend-icon="categoryIcon(c)"
                :color="activeCategory === c.slug ? 'primary' : undefined"
                :variant="activeCategory === c.slug ? 'flat' : 'tonal'"
                @click="setCategory(c.slug)"
              >
                {{ c.label }}
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>
          <v-slide-group v-if="subcategories.length" show-arrows="never">
            <v-slide-group-item v-for="s in subcategories" :key="s.slug">
              <v-chip
                class="mr-2"
                size="small"
                :color="activeSub === s.slug ? 'primary' : undefined"
                :variant="activeSub === s.slug ? 'flat' : 'outlined'"
                @click="setSub(activeSub === s.slug ? null : s.slug)"
              >
                {{ s.label }}
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>
        </div>

        <!-- ======================== 3D STAGE ======================== -->
        <div
          ref="stageEl"
          class="stage"
          :class="[`stage--${stageBg}`, { 'stage--pseudo-fs': pseudoFs }]"
        >
          <model-viewer
            v-if="glbUrl"
            :key="`${glbUrl}::${modelKey}`"
            ref="mv"
            class="stage__viewer"
            :src="glbUrl"
            :alt="title || 'Museum artefact'"
            :auto-rotate="autoRotate && !prefersReducedMotion ? '' : null"
            camera-controls
            autoplay
            ar
            ar-modes="webxr scene-viewer quick-look"
            interaction-prompt="none"
            environment-image="neutral"
            :shadow-intensity="shadowOn ? 1 : 0"
            :shadow-softness="0.9"
            :exposure="exposure"
            loading="eager"
            reveal="auto"
            min-field-of-view="12deg"
            max-field-of-view="45deg"
            @progress="onProgress"
            @load="onLoad"
            @error="onModelError"
          />

          <v-img
            v-if="coverUrl && modelLoading && !glbError"
            :src="coverUrl"
            cover
            class="stage__poster"
          />

          <!-- Empty / error / loading states -->
          <div v-if="!selectedId" class="stage__status">
            <v-icon size="48">mdi-cube-outline</v-icon>
            <div>Pick an artefact below to view it in 3D.</div>
          </div>
          <div v-else-if="!glbUrl && !artefact" class="stage__status">
            <v-progress-circular indeterminate size="36" />
          </div>
          <div v-else-if="!glbUrl" class="stage__status">
            <v-icon size="48">mdi-cube-off-outline</v-icon>
            <div>This artefact has no 3D model yet.</div>
          </div>
          <div v-else-if="modelLoading && !glbError" class="stage__status">
            <v-progress-circular
              v-if="progress <= 0"
              indeterminate
              size="44"
              width="4"
            />
            <v-progress-circular
              v-else
              :model-value="progress"
              size="44"
              width="4"
            >
              <span class="text-caption tabular">
                {{ Math.round(progress) }}
              </span>
            </v-progress-circular>
            <div class="text-caption">Loading 3D model…</div>
          </div>

          <v-alert
            v-if="glbError"
            type="error"
            density="compact"
            variant="flat"
            class="stage__alert"
          >
            {{ glbErrorMessage }}
            <template #append>
              <v-btn size="small" variant="text" @click="retryModel">
                Retry
              </v-btn>
            </template>
          </v-alert>

          <!-- Top overlay -->
          <div v-if="selectedId" class="stage__top">
            <v-chip size="small" class="stage__glass text-truncate">
              {{ categoryText }}
            </v-chip>
            <v-chip size="small" class="stage__glass ml-auto flex-shrink-0">
              <span class="tabular">
                {{ selIndex + 1 }} / {{ totalCount || thumbs.length }}
              </span>
            </v-chip>
          </div>

          <!-- Prev / next -->
          <v-tooltip
            v-for="n in [-1, 1] as const"
            :key="n"
            :text="n < 0 ? 'Previous  [' : 'Next  ]'"
            location="top"
            :attach="overlayAttach"
          >
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                :icon="n < 0 ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                variant="flat"
                :size="isDesktop ? 'default' : 'small'"
                class="stage__glass stage__nav"
                :class="n < 0 ? 'stage__nav--prev' : 'stage__nav--next'"
                :disabled="!canStep(n)"
                :aria-label="n < 0 ? 'Previous artefact' : 'Next artefact'"
                @click="stepArtefact(n)"
              />
            </template>
          </v-tooltip>

          <!-- Player controls -->
          <v-sheet
            rounded="pill"
            elevation="6"
            class="stage__glass stage__controls d-flex align-center px-1"
            role="toolbar"
            aria-label="3D viewer controls"
          >
            <v-tooltip
              v-for="b in controls"
              :key="b.icon"
              :text="b.label"
              location="top"
              :attach="overlayAttach"
            >
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  :icon="b.icon"
                  :size="isDesktop ? 'default' : 'small'"
                  :variant="b.active ? 'flat' : 'text'"
                  :color="b.active ? 'primary' : undefined"
                  :aria-label="b.label"
                  :aria-pressed="b.active === undefined ? undefined : b.active"
                  :disabled="!glbUrl"
                  @click="b.run"
                />
              </template>
            </v-tooltip>

            <v-menu
              location="top"
              :close-on-content-click="false"
              :attach="overlayAttach"
            >
              <template #activator="{ props: menuProps }">
                <v-tooltip
                  text="More: snapshot, AR, lighting"
                  location="top"
                  :attach="overlayAttach"
                >
                  <template #activator="{ props: tipProps }">
                    <v-btn
                      v-bind="mergeProps(menuProps, tipProps)"
                      icon="mdi-dots-vertical"
                      :size="isDesktop ? 'default' : 'small'"
                      variant="text"
                      aria-label="More viewer options"
                      :disabled="!glbUrl"
                    />
                  </template>
                </v-tooltip>
              </template>

              <v-card min-width="260" max-width="300">
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-camera-outline"
                    title="Save snapshot"
                    @click="snapshot"
                  />
                  <v-list-item
                    v-if="canAR"
                    prepend-icon="mdi-augmented-reality"
                    title="View in your space (AR)"
                    @click="activateAR"
                  />
                  <v-list-item
                    v-if="animationCount"
                    :prepend-icon="animPlaying ? 'mdi-pause' : 'mdi-play'"
                    :title="animPlaying ? 'Pause animation' : 'Play animation'"
                    @click="toggleAnimation"
                  />
                  <v-list-item
                    v-if="isDesktop"
                    prepend-icon="mdi-keyboard-outline"
                    title="Keyboard shortcuts"
                    @click="shortcutsOpen = true"
                  />
                  <v-divider class="my-1" />
                  <v-list-item title="Background">
                    <template #append>
                      <v-btn-toggle
                        v-model="stageBg"
                        mandatory
                        density="compact"
                        variant="outlined"
                        divided
                      >
                        <v-btn
                          value="dark"
                          icon="mdi-weather-night"
                          size="small"
                        />
                        <v-btn
                          value="light"
                          icon="mdi-white-balance-sunny"
                          size="small"
                        />
                      </v-btn-toggle>
                    </template>
                  </v-list-item>
                  <v-list-item title="Brightness">
                    <v-slider
                      v-model="exposure"
                      :min="0.4"
                      :max="2"
                      :step="0.05"
                      density="compact"
                      hide-details
                      color="primary"
                      class="mt-1"
                    />
                  </v-list-item>
                  <v-list-item title="Soft shadow">
                    <template #append>
                      <v-switch
                        v-model="shadowOn"
                        color="primary"
                        density="compact"
                        hide-details
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </v-sheet>

          <v-progress-linear
            v-if="glbUrl && modelLoading && progress > 0"
            :model-value="progress"
            height="3"
            class="stage__progress"
          />
        </div>

        <!-- ================== NOW VIEWING BAR ================== -->
        <v-sheet
          border="t"
          class="d-flex align-center ga-2 px-3 py-2 flex-grow-0"
        >
          <div class="flex-grow-1" style="min-width: 0">
            <div class="text-subtitle-1 font-weight-medium text-truncate">
              {{ title || "Select an artefact" }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ categoryText }}
              <template v-if="priceText"> · {{ priceText }}</template>
            </div>
          </div>

          <v-tooltip text="Story & details" location="top">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                icon="mdi-information-outline"
                variant="tonal"
                class="d-lg-none"
                :disabled="!selectedId"
                aria-label="Artefact details"
                @click="detailsOpen = true"
              />
            </template>
          </v-tooltip>

          <v-btn
            :color="inCart ? undefined : 'primary'"
            :variant="inCart ? 'tonal' : 'flat'"
            :prepend-icon="inCart ? 'mdi-cart-check' : 'mdi-cart-plus'"
            :disabled="!artefact"
            class="text-none"
            @click="inCart ? goCheckout() : addToCart()"
          >
            {{ inCart ? "Check out" : "Add to cart" }}
          </v-btn>
        </v-sheet>

        <!-- ================== FILMSTRIP ================== -->
        <v-sheet border="t" class="flex-grow-0 py-1">
          <div
            v-if="thumbsError"
            class="d-flex align-center ga-2 px-3 py-2 text-error"
          >
            <v-icon>mdi-alert-circle-outline</v-icon>
            <span class="text-body-2 flex-grow-1">{{ thumbsError }}</span>
            <v-btn size="small" variant="text" @click="loadThumbs()">
              Retry
            </v-btn>
          </div>

          <div
            v-else-if="!thumbsLoading && !thumbs.length"
            class="d-flex align-center ga-2 px-3 py-3 text-medium-emphasis"
          >
            <span class="text-body-2 flex-grow-1">
              No published artefacts match this filter yet.
            </span>
            <v-btn
              v-if="hasFilters"
              size="small"
              variant="tonal"
              prepend-icon="mdi-filter-remove-outline"
              @click="resetFilters"
            >
              Clear filters
            </v-btn>
          </div>

          <v-slide-group
            v-else
            :model-value="selectedId"
            center-active
            show-arrows
          >
            <template v-if="thumbsLoading && !thumbs.length">
              <v-slide-group-item v-for="n in 8" :key="`sk-${n}`">
                <v-skeleton-loader type="image" width="112" class="ma-1" />
              </v-slide-group-item>
            </template>

            <v-slide-group-item v-for="t in thumbs" :key="t.id" :value="t.id">
              <v-tooltip :text="t.title" location="top">
                <template #activator="{ props: tip }">
                  <v-card
                    v-bind="tip"
                    :variant="t.id === selectedId ? 'tonal' : 'outlined'"
                    :color="t.id === selectedId ? 'primary' : undefined"
                    class="thumb ma-1"
                    :class="{ 'thumb--active': t.id === selectedId }"
                    :aria-current="t.id === selectedId ? 'true' : undefined"
                    @click="select(t)"
                  >
                    <v-img
                      v-if="coverOf(t)"
                      :src="coverOf(t)!"
                      :aspect-ratio="4 / 3"
                      cover
                    />
                    <div
                      v-else
                      class="thumb__none d-flex align-center justify-center"
                    >
                      <v-icon>mdi-cube-outline</v-icon>
                    </div>
                    <div class="text-caption text-truncate px-2 py-1">
                      {{ t.title }}
                    </div>
                  </v-card>
                </template>
              </v-tooltip>
            </v-slide-group-item>

            <v-slide-group-item v-if="hasNext">
              <v-btn
                variant="tonal"
                class="ma-1 thumb thumb--more"
                :loading="thumbsLoading"
                prepend-icon="mdi-plus"
                @click="loadThumbs(true)"
              >
                More
              </v-btn>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>
    </v-main>

    <!-- ============ Keyboard shortcuts ============ -->
    <v-dialog v-model="shortcutsOpen" max-width="420" z-index="3200">
      <v-card>
        <v-card-title class="text-subtitle-1">Controls</v-card-title>
        <v-list density="compact">
          <v-list-item
            title="Mouse / touch"
            subtitle="Drag to orbit, wheel or pinch to zoom, right-drag to pan"
          />
          <v-list-item v-for="k in shortcuts" :key="k.keys" :title="k.label">
            <template #append>
              <kbd class="explorer__kbd">{{ k.keys }}</kbd>
            </template>
          </v-list-item>
          <v-list-item
            title="Gamepad"
            subtitle="Left stick orbit, right stick zoom, A auto-rotate, B reset, LB/RB browse"
          />
        </v-list>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="shortcutsOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  nextTick,
  watch,
  mergeProps,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import {
  useArtefactsStore,
  type Artefact,
  type ThumbItem,
  type ArtefactFilterInput,
} from "@/stores/artefacts";
import { useVoucherStore } from "@/stores/vouchers";
import VoucherPurchaseDialog from "@/components/dialogs/VoucherPurchase.vue";

interface ModelViewerEl extends HTMLElement {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  getCameraOrbit(): { theta: number; phi: number; radius: number };
  getFieldOfView(): number;
  jumpCameraToGoal(): void;
  canActivateAR?: boolean;
  activateAR?: () => Promise<void>;
  toBlob?: (o?: { mimeType?: string; idealAspect?: boolean }) => Promise<Blob>;
  availableAnimations?: string[];
  paused?: boolean;
  play?: () => void;
  pause?: () => void;
}

const ALL = "__all__";
const PAGE_SIZE = 12;
const PREFETCH_RADIUS = 4;
const CART_STORAGE_KEY = "tukema.cart";
const MUTE_STORAGE_KEY = "tukema.voucher.mute";
const LOW_MS = 5 * 60_000;

/* ------------------------------------------------------------------ */
/* Stores / layout                                                     */
/* ------------------------------------------------------------------ */

const store = useArtefactsStore();
const voucherStore = useVoucherStore();
const route = useRoute();
const router = useRouter();
const display = useDisplay();

/* md+ : categories permanent · lg+ : details permanent */
const isDesktop = computed(() => display.mdAndUp.value);
const isWide = computed(() => display.lgAndUp.value);

const catDrawer = ref(false);
const detailsOpen = ref(false);
watch(isDesktop, () => {
  catDrawer.value = false;
  detailsOpen.value = false;
});

const accessGranted = computed(() => voucherStore.isRedeemed);
const validating = computed(
  () =>
    voucherStore.status === "checking" || voucherStore.status === "redeeming",
);
const locked = computed(() => !accessGranted.value && !validating.value);
const buyOpen = ref(false);
const openBuyMore = () => (buyOpen.value = true);

/* ------------------------------------------------------------------ */
/* Notices                                                             */
/* ------------------------------------------------------------------ */

const notice = reactive({
  show: false,
  text: "",
  color: "info",
  action: false,
});
function notify(text: string, color = "info", action = false) {
  notice.text = text;
  notice.color = color;
  notice.action = action;
  notice.show = true;
}

/* ------------------------------------------------------------------ */
/* Time left                                                           */
/* ------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const countdownText = computed(() =>
  voucherStore.isFinalCountdown
    ? voucherStore.remainingLabelFine
    : voucherStore.remainingLabel,
);
const isFinalCountdown = computed(() => voucherStore.isFinalCountdown);
const countdownIcon = computed(() =>
  isFinalCountdown.value ? "mdi-timer-alert-outline" : "mdi-timer-outline",
);

type TimeLevel = "ok" | "low" | "final" | "critical";
const timeLevel = computed<TimeLevel>(() => {
  const ms = voucherStore.remainingMs;
  if (isFinalCountdown.value) return ms <= 10_000 ? "critical" : "final";
  return ms <= LOW_MS ? "low" : "ok";
});
const timeColor = computed(
  () =>
    ({ ok: "success", low: "warning", final: "warning", critical: "error" })[
      timeLevel.value
    ],
);
const timeStatusText = computed(
  () =>
    ({
      ok: "You have plenty of time.",
      low: "Less than 5 minutes left.",
      final: "Wrapping up soon.",
      critical: "Access ends in seconds.",
    })[timeLevel.value],
);

/* Session length is captured when a ticket starts so we can show a ring. */
const sessionTotal = ref(0);
const timePercent = computed(() =>
  Math.round(
    clamp(voucherStore.remainingMs / Math.max(sessionTotal.value, 1), 0, 1) *
      100,
  ),
);

const expiresText = computed(() => {
  const v = voucherStore.activeUntil as unknown;
  if (!v) return "";
  const d = new Date(v as string | number | Date);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-KE", { timeStyle: "short" });
});
const timeTooltip = computed(() =>
  countdownText.value
    ? `${countdownText.value} left · tap for details`
    : "Time left",
);

/* ------------------------------------------------------------------ */
/* Cue sound (Web Audio)                                               */
/* ------------------------------------------------------------------ */

const muted = ref(false);
const prefersReducedMotion = ref(false);
const soundDisabled = computed(() => muted.value || prefersReducedMotion.value);

let audioCtx: AudioContext | null = null;
let reducedMq: MediaQueryList | null = null;
const onReducedChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion.value = e.matches;
};

function readMuteState() {
  try {
    muted.value = sessionStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    muted.value = false;
  }
}
function toggleMute() {
  muted.value = !muted.value;
  try {
    sessionStorage.setItem(MUTE_STORAGE_KEY, muted.value ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (!muted.value) void beep([{ freq: 660, dur: 0.08, gain: 0.06 }]);
}
function detectReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return;
  reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = reducedMq.matches;
  reducedMq.addEventListener?.("change", onReducedChange);
}
function unlockAudio() {
  if (audioCtx) return;
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
  } catch {
    audioCtx = null;
  }
}

type Beep = { freq: number; dur: number; gain: number; delay?: number };
async function beep(beeps: Beep[]) {
  if (soundDisabled.value || !audioCtx) return;
  try {
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const t0 = audioCtx.currentTime;
    for (const b of beeps) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const at = t0 + (b.delay ?? 0);
      osc.type = "sine";
      osc.frequency.value = b.freq;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(b.gain, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + b.dur);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(at);
      osc.stop(at + b.dur + 0.02);
    }
  } catch {
    /* ignore */
  }
}

let cueFivePlayed = false;
let cueThirtyPlayed = false;
let cueTenPlayed = false;

watch(
  () => voucherStore.remainingMs,
  (ms) => {
    if (ms > sessionTotal.value) sessionTotal.value = ms;
    if (!accessGranted.value || ms <= 0) return;

    if (!cueFivePlayed && ms <= LOW_MS && ms > 30_000) {
      cueFivePlayed = true;
      notify("Less than 5 minutes of access left.", "warning", true);
    }
    if (!cueThirtyPlayed && ms <= 30_000 && ms > 10_000) {
      cueThirtyPlayed = true;
      notify("30 seconds left.", "warning", true);
      void beep([{ freq: 660, dur: 0.14, gain: 0.07 }]);
      if (!isDesktop.value) navigator.vibrate?.(30);
    }
    if (!cueTenPlayed && ms <= 10_000) {
      cueTenPlayed = true;
      void beep([
        { freq: 880, dur: 0.07, gain: 0.08, delay: 0 },
        { freq: 880, dur: 0.07, gain: 0.08, delay: 0.12 },
        { freq: 880, dur: 0.07, gain: 0.08, delay: 0.24 },
      ]);
      if (!isDesktop.value) navigator.vibrate?.([40, 60, 40, 60, 40]);
    }
  },
);

watch(
  () => voucherStore.activeUntil,
  (v) => {
    cueFivePlayed = false;
    cueThirtyPlayed = false;
    cueTenPlayed = false;
    sessionTotal.value = v ? voucherStore.remainingMs : 0;
    if (v) unlockAudio();
  },
  { immediate: true },
);

/* ------------------------------------------------------------------ */
/* Refs / state                                                        */
/* ------------------------------------------------------------------ */

const stageEl = ref<HTMLElement | null>(null);
const mv = ref<ModelViewerEl | null>(null);
const searchField = ref<{ focus: () => void } | null>(null);

const activeCategory = ref<string>(ALL);
const activeSub = ref<string | null>(null);
const searchText = ref("");
const openGroups = ref<string[]>([]);

const thumbs = ref<ThumbItem[]>([]);
const totalCount = ref(0);
const hasNext = ref(false);
const thumbsLoading = ref(false);
const thumbsError = ref<string | null>(null);
let thumbsReq = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const selectedId = ref<string | null>(null);

/* Player state */
const autoRotate = ref(true);
const modelLoading = ref(false);
const progress = ref(0);
const glbError = ref(false);
const glbErrorMessage = ref("The 3D model could not be loaded.");
const modelKey = ref(0);
const isFullscreen = ref(false);
const pseudoFs = ref(false);
const exposure = ref(1.05);
const shadowOn = ref(true);
const stageBg = ref<"dark" | "light">("dark");
const canAR = ref(false);
const animationCount = ref(0);
const animPlaying = ref(false);
const shortcutsOpen = ref(false);
const prefetching = new Set<string>();

/* Menus/tooltips must live inside the stage while it is fullscreen. */
const overlayAttach = computed<HTMLElement | false>(() =>
  isFullscreen.value && stageEl.value ? stageEl.value : false,
);

const hasFilters = computed(
  () =>
    activeCategory.value !== ALL ||
    !!activeSub.value ||
    !!searchText.value.trim(),
);

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

const cartIds = ref<Set<string>>(new Set());

function refreshCartIds() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cartIds.value = new Set<string>(
      Array.isArray(parsed) ? parsed.map((p: any) => String(p.id)) : [],
    );
  } catch {
    cartIds.value = new Set();
  }
}
const checkCart = refreshCartIds;
const inCart = computed(
  () => !!selectedId.value && cartIds.value.has(String(selectedId.value)),
);

function addToCart() {
  const a = selectedId.value ? store.byId[selectedId.value] : null;
  if (!a) return;
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    let cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
    if (!cart.some((item: any) => item.id === a.id)) {
      cart.push({ ...a, qty: 1 });
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (!isDesktop.value) navigator.vibrate?.(12);
    }
    refreshCartIds();
  } catch {
    /* ignore */
  }
}
function goCheckout() {
  void router.push("/museum/checkout");
}

/* ------------------------------------------------------------------ */
/* Gate                                                                */
/* ------------------------------------------------------------------ */

const tokenParam = () => {
  const q = route.query.tokenKey;
  return (Array.isArray(q) ? q[0] : q)?.toString() ?? "";
};
function stripTokenFromUrl() {
  const { tokenKey: _drop, ...rest } = route.query;
  void router.replace({ query: rest });
}
async function enterGate() {
  const hadToken = !!tokenParam();
  const res = await voucherStore.enter(tokenParam());
  if (res.success && hadToken) stripTokenFromUrl();
}
watch(
  () => route.query.tokenKey,
  (k) => {
    if (k) void enterGate();
  },
);

async function onPurchaseSuccess(payload: any) {
  unlockAudio();
  buyOpen.value = false;
  await voucherStore.redeemPayload(payload);
  if (!selectedId.value && thumbs.value[0]) void select(thumbs.value[0]);
}

/* ------------------------------------------------------------------ */
/* Media extraction                                                    */
/* ------------------------------------------------------------------ */

const GLB_PATH_RE = /(?:\.glb\b|\/glb\/)/i;
const IMG_PATH_RE = /\.(?:jpe?g|png|webp|avif|gif)(?:\b|$)/i;
const TIMESTAMP_RE = /^(\d{8}T\d{6}Z?)/i;

const pathOf = (u: string) => {
  const q = u.indexOf("?");
  return q === -1 ? u : u.slice(0, q);
};
const baseName = (u: string) => {
  const p = pathOf(u);
  const slash = p.lastIndexOf("/");
  return slash === -1 ? p : p.slice(slash + 1);
};
function glbTimestamp(u: string) {
  const m = baseName(u).match(TIMESTAMP_RE);
  return m ? m[1] : "";
}
function pickGlb(urls: readonly string[] | null | undefined): string | null {
  if (!urls?.length) return null;
  let best: string | null = null;
  let bestTs = "";
  let bestName = "";
  for (const u of urls) {
    if (!GLB_PATH_RE.test(pathOf(u))) continue;
    const ts = glbTimestamp(u);
    const name = baseName(u);
    if (best === null || ts > bestTs || (ts === bestTs && name < bestName)) {
      best = u;
      bestTs = ts;
      bestName = name;
    }
  }
  return best;
}
function pickCover(urls: readonly string[] | null | undefined): string | null {
  if (!urls?.length) return null;
  let fallback: string | null = null;
  for (const u of urls) {
    const path = pathOf(u);
    if (!IMG_PATH_RE.test(path) || GLB_PATH_RE.test(path)) continue;
    if (/cover/i.test(path)) return u;
    fallback ??= u;
  }
  return fallback;
}
const mediaCache = new WeakMap<
  readonly string[],
  { glb: string | null; cover: string | null }
>();
function mediaOf(urls: readonly string[] | null | undefined) {
  if (!urls?.length)
    return { glb: null as string | null, cover: null as string | null };
  const hit = mediaCache.get(urls);
  if (hit) return hit;
  const value = { glb: pickGlb(urls), cover: pickCover(urls) };
  mediaCache.set(urls, value);
  return value;
}
const coverOf = (a: { mediaUrls: string[] }) => mediaOf(a.mediaUrls).cover;

/* ------------------------------------------------------------------ */
/* Derived data                                                        */
/* ------------------------------------------------------------------ */

const light = computed(
  () => thumbs.value.find((t) => t.id === selectedId.value) ?? null,
);
const artefact = computed<Artefact | null>(() =>
  selectedId.value ? (store.byId[selectedId.value] ?? null) : null,
);
const media = computed(() => {
  if (artefact.value) return mediaOf(artefact.value.mediaUrls);
  if (light.value) return mediaOf(light.value.mediaUrls);
  return { glb: null as string | null, cover: null as string | null };
});
const glbUrl = computed(() => media.value.glb);
const coverUrl = computed(() => media.value.cover);
const title = computed(() => artefact.value?.title ?? light.value?.title ?? "");
const categoryText = computed(() => {
  const a = artefact.value ?? light.value;
  if (!a) return "";
  const parts = [store.categoryLabel(a.category)];
  if (a.subcategory)
    parts.push(store.subcategoryLabel(a.category, a.subcategory));
  return parts.join(" · ");
});
function priceTextFor(t: { currency?: string; price?: number }) {
  if (!t.currency || typeof t.price !== "number") return "";
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: t.currency,
      maximumFractionDigits: 0,
    }).format(t.price);
  } catch {
    return `${t.currency} ${t.price}`;
  }
}
const priceText = computed(() =>
  artefact.value ? priceTextFor(artefact.value) : "",
);
const updatedText = computed(() =>
  artefact.value
    ? new Date(artefact.value.updatedAt).toLocaleDateString("en-KE", {
        dateStyle: "medium",
      })
    : "",
);
const subcategories = computed(() =>
  activeCategory.value === ALL
    ? []
    : store.subcategoriesOf(activeCategory.value),
);
const selIndex = computed(() =>
  thumbs.value.findIndex((t) => t.id === selectedId.value),
);

const CATEGORY_ICONS: [RegExp, string][] = [
  [/mask|ritual|spirit|ceremon/, "mdi-drama-masks"],
  [/textile|cloth|bead|jewel|ornament|adorn|dress|regalia/, "mdi-necklace"],
  [/pot|ceram|vessel|basket|household|domestic/, "mdi-pot-outline"],
  [/tool|weapon|hunt|farm|agri|iron/, "mdi-hammer-wrench"],
  [/music|instrument|drum/, "mdi-music-note"],
  [/sculpt|statue|figure|carv|wood/, "mdi-chess-pawn"],
];
function categoryIcon(c: { slug: string; label: string }) {
  const s = `${c.slug} ${c.label}`.toLowerCase();
  return CATEGORY_ICONS.find(([re]) => re.test(s))?.[1] ?? "mdi-shape-outline";
}

/* ------------------------------------------------------------------ */
/* Preflight / loading / selection                                    */
/* ------------------------------------------------------------------ */

const probeCache = new Map<string, Promise<boolean>>();
function probeGlb(url: string): Promise<boolean> {
  const hit = probeCache.get(url);
  if (hit) return hit;
  const p = (async () => {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        credentials: "omit",
        cache: "no-store",
      });
      return res.ok || res.status === 206;
    } catch {
      return false;
    }
  })();
  probeCache.set(url, p);
  return p;
}

async function loadThumbs(append = false) {
  const req = ++thumbsReq;
  thumbsLoading.value = true;
  thumbsError.value = null;
  try {
    const filter: ArtefactFilterInput = {};
    if (activeCategory.value !== ALL) {
      filter.category = activeCategory.value;
      if (activeSub.value) filter.subcategory = activeSub.value;
    }
    if (searchText.value.trim()) filter.search = searchText.value.trim();

    const conn = await store.fetchThumbs({
      filter,
      limit: PAGE_SIZE,
      offset: append ? thumbs.value.length : 0,
    });
    if (req !== thumbsReq) return;

    thumbs.value = append ? [...thumbs.value, ...conn.edges] : conn.edges;
    totalCount.value = conn.totalCount;
    hasNext.value = conn.hasNextPage;

    if (!append && !thumbs.value.some((t) => t.id === selectedId.value)) {
      const next = thumbs.value[0];
      if (next) void select(next);
      else clearSelection();
    } else if (!append) {
      prefetchAround();
    }
  } catch (e) {
    if (req === thumbsReq)
      thumbsError.value =
        e instanceof Error ? e.message : "Could not load artefacts.";
  } finally {
    if (req === thumbsReq) thumbsLoading.value = false;
  }
}

function clearSelection() {
  selectedId.value = null;
  glbError.value = false;
  store.clearCurrent();
}

async function select(item: ThumbItem) {
  const id = item.id;
  selectedId.value = id;
  checkCart();

  glbError.value = false;
  glbErrorMessage.value = "The 3D model could not be loaded.";
  progress.value = 0;
  modelLoading.value = !!pickGlb(item.mediaUrls);

  /* Keep the strip topped up before the user hits the end. */
  if (
    hasNext.value &&
    !thumbsLoading.value &&
    selIndex.value >= thumbs.value.length - 3
  )
    void loadThumbs(true);

  try {
    await store.fetchArtefact(id);
  } catch {
    /* ignore */
  }

  const url = glbUrl.value;
  if (url && selectedId.value === id) {
    const ok = await probeGlb(url);
    if (!ok && glbUrl.value === url) {
      glbError.value = true;
      glbErrorMessage.value =
        "The 3D model could not be fetched (network or CORS).";
      modelLoading.value = false;
    }
  }
  if (selectedId.value === id) prefetchAround();
}

function prefetchAround() {
  const i = selIndex.value;
  if (i < 0) return;
  const radius = isDesktop.value ? PREFETCH_RADIUS : 1;
  const from = Math.max(0, i - radius);
  const to = Math.min(thumbs.value.length, i + radius + 1);
  const ids: string[] = [];
  for (let k = from; k < to; k++) {
    const id = thumbs.value[k].id;
    if (id === selectedId.value) continue;
    if (store.byId[id]) {
      const u = mediaOf(store.byId[id].mediaUrls).glb;
      if (u) void probeGlb(u);
      continue;
    }
    if (prefetching.has(id)) continue;
    ids.push(id);
  }
  if (!ids.length) return;
  void Promise.allSettled(
    ids.map(async (id) => {
      prefetching.add(id);
      try {
        const a = await store.fetchArtefact(id, false, false);
        if (a) {
          const u = mediaOf(a.mediaUrls).glb;
          if (u) void probeGlb(u);
        }
      } finally {
        prefetching.delete(id);
      }
    }),
  );
}

function canStep(dir: 1 | -1) {
  const i = selIndex.value + dir;
  if (i >= 0 && i < thumbs.value.length) return true;
  return dir === 1 && hasNext.value;
}

async function stepArtefact(dir: 1 | -1) {
  const i = selIndex.value + dir;
  if (i >= 0 && i < thumbs.value.length) return select(thumbs.value[i]);
  if (dir === 1 && hasNext.value && !thumbsLoading.value) {
    await loadThumbs(true);
    const next = thumbs.value[i];
    if (next) return select(next);
  }
}

/* ------------------------------------------------------------------ */
/* Category explorer                                                   */
/* ------------------------------------------------------------------ */

function closeDrawerOnPhone() {
  if (!isDesktop.value) catDrawer.value = false;
}

function setCategory(slug: unknown) {
  activeCategory.value = (slug as string) || ALL;
  activeSub.value = null;
  clearSelection();
  void loadThumbs();
  /* Keep the drawer open when there are sub-categories to choose from. */
  if (
    activeCategory.value === ALL ||
    !store.subcategoriesOf(activeCategory.value).length
  )
    closeDrawerOnPhone();
}

function setSub(slug: unknown) {
  activeSub.value = (slug as string) || null;
  clearSelection();
  void loadThumbs();
}

function pickSub(cat: string, sub: string) {
  if (activeCategory.value !== cat) activeCategory.value = cat;
  setSub(activeSub.value === sub && activeCategory.value === cat ? null : sub);
  closeDrawerOnPhone();
}

/* Auto-expand the active category's group. */
watch(activeCategory, (slug) => {
  if (slug !== ALL && !openGroups.value.includes(slug))
    openGroups.value = [...openGroups.value, slug];
});

function resetFilters() {
  activeCategory.value = ALL;
  activeSub.value = null;
  searchText.value = "";
  clearSelection();
  void loadThumbs();
}

function onSearchChanged(value: string | null) {
  searchText.value = value ?? "";
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    clearSelection();
    void loadThumbs();
  }, 300);
}

async function openSearch() {
  catDrawer.value = true;
  await nextTick();
  setTimeout(() => searchField.value?.focus(), 250);
}

/* ------------------------------------------------------------------ */
/* Viewer controls                                                     */
/* ------------------------------------------------------------------ */

function orbitBy(dTheta: number, dPhi: number, instant = false) {
  const el = mv.value;
  if (!el?.getCameraOrbit) return;
  const o = el.getCameraOrbit();
  const phi = clamp(o.phi + dPhi, 0.05, Math.PI - 0.05);
  el.cameraOrbit = `${o.theta + dTheta}rad ${phi}rad ${o.radius}m`;
  if (instant) el.jumpCameraToGoal();
}

function zoomBy(factor: number) {
  const el = mv.value;
  if (!el?.getFieldOfView) return;
  el.fieldOfView = `${clamp(el.getFieldOfView() * factor, 12, 45)}deg`;
}

function resetView() {
  const el = mv.value;
  if (!el) return;
  el.cameraOrbit = "auto auto auto";
  el.cameraTarget = "auto auto auto";
  el.fieldOfView = "auto";
  el.jumpCameraToGoal();
}

const toggleRotate = () => (autoRotate.value = !autoRotate.value);

function toggleFullscreen() {
  const el = stageEl.value;
  if (!el) return;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  if (pseudoFs.value) {
    pseudoFs.value = false;
    isFullscreen.value = false;
    return;
  }
  const fallback = () => {
    pseudoFs.value = true;
    isFullscreen.value = true;
  };
  if (el.requestFullscreen) void el.requestFullscreen().catch(fallback);
  else fallback(); /* iOS Safari: no element fullscreen */
}
const onFsChange = () =>
  (isFullscreen.value = !!document.fullscreenElement || pseudoFs.value);

async function snapshot() {
  const el = mv.value;
  if (!el?.toBlob)
    return notify("Snapshots are not supported here.", "warning");
  try {
    const blob = await el.toBlob({ mimeType: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name =
      title.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "artefact";
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Snapshot saved.", "success");
  } catch {
    notify("Could not capture a snapshot.", "error");
  }
}

function activateAR() {
  void mv.value
    ?.activateAR?.()
    .catch(() => notify("AR is not available.", "warning"));
}

function toggleAnimation() {
  const el = mv.value;
  if (!el) return;
  if (el.paused) el.play?.();
  else el.pause?.();
  animPlaying.value = !el.paused;
}

const controls = computed(() => [
  {
    icon: "mdi-rotate-3d-variant",
    label: "Auto-rotate (Space)",
    active: autoRotate.value,
    run: toggleRotate,
  },
  {
    icon: "mdi-magnify-minus-outline",
    label: "Zoom out (−)",
    run: () => zoomBy(1 / 0.85),
  },
  {
    icon: "mdi-magnify-plus-outline",
    label: "Zoom in (+)",
    run: () => zoomBy(0.85),
  },
  { icon: "mdi-restore", label: "Reset view (R)", run: resetView },
  {
    icon: isFullscreen.value ? "mdi-fullscreen-exit" : "mdi-fullscreen",
    label: isFullscreen.value ? "Exit fullscreen (F)" : "Fullscreen (F)",
    run: toggleFullscreen,
  },
]);

const shortcuts = [
  { keys: "← → ↑ ↓", label: "Orbit (Shift = faster)" },
  { keys: "+ / −", label: "Zoom in / out" },
  { keys: "Space", label: "Auto-rotate on/off" },
  { keys: "R", label: "Reset view" },
  { keys: "F", label: "Fullscreen" },
  { keys: "[ / ]", label: "Previous / next artefact" },
];

function onProgress(e: Event) {
  const d = (e as CustomEvent).detail as
    { totalProgress?: number; loaded?: number; total?: number } | undefined;
  if (!d) return;
  let p = 0;
  if (typeof d.totalProgress === "number") p = d.totalProgress;
  else if (typeof d.loaded === "number" && typeof d.total === "number")
    p = d.total ? d.loaded / d.total : 0;
  progress.value = clamp(p * 100, 0, 100);
}

function onLoad() {
  modelLoading.value = false;
  progress.value = 100;
  glbError.value = false;
  const el = mv.value;
  animationCount.value = el?.availableAnimations?.length ?? 0;
  animPlaying.value = animationCount.value > 0 && !el?.paused;
  canAR.value = !!el?.canActivateAR;
}

function onModelError() {
  modelLoading.value = false;
  progress.value = 0;
  glbError.value = true;
  glbErrorMessage.value = "The 3D model could not be loaded.";
}

function retryModel() {
  if (!glbUrl.value) return;
  glbError.value = false;
  probeCache.delete(glbUrl.value);
  modelLoading.value = true;
  progress.value = 0;
  modelKey.value++;
}

watch(glbUrl, (u) => {
  glbError.value = false;
  progress.value = 0;
  canAR.value = false;
  animationCount.value = 0;
  modelLoading.value = !!u;
  if (u) modelKey.value++;
});

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */

function onKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!accessGranted.value) return;

  const t = e.target as HTMLElement | null;
  if (
    t?.closest(
      'input,textarea,select,[contenteditable="true"],[role="tablist"],[role="menu"],[role="dialog"],[role="listbox"]',
    )
  )
    return;

  const onButton = !!t?.closest('button,[role="button"],a');
  const nudge = e.shiftKey ? 0.36 : 0.12;
  let handled = true;

  switch (e.key) {
    case "ArrowLeft":
      orbitBy(-nudge, 0);
      break;
    case "ArrowRight":
      orbitBy(nudge, 0);
      break;
    case "ArrowUp":
      orbitBy(0, -nudge);
      break;
    case "ArrowDown":
      orbitBy(0, nudge);
      break;
    case "+":
    case "=":
    case "PageUp":
      zoomBy(0.85);
      break;
    case "-":
    case "_":
    case "PageDown":
      zoomBy(1 / 0.85);
      break;
    case " ":
      if (onButton) {
        handled = false;
        break;
      }
      toggleRotate();
      break;
    case "r":
    case "R":
    case "0":
      resetView();
      break;
    case "f":
    case "F":
      toggleFullscreen();
      break;
    case "[":
      void stepArtefact(-1);
      break;
    case "]":
      void stepArtefact(1);
      break;
    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
}

/* ------------------------------------------------------------------ */
/* Gamepad                                                             */
/* ------------------------------------------------------------------ */

let raf = 0;
const padDown: Record<number, boolean> = {};
function pollPad() {
  if (accessGranted.value) {
    const pad = Array.from(navigator.getGamepads?.() ?? []).find(Boolean);
    if (pad) {
      const dz = (v = 0) => (Math.abs(v) > 0.18 ? v : 0);
      const x = dz(pad.axes[0]);
      const y = dz(pad.axes[1]);
      const z = dz(pad.axes[3]);
      if (x || y) orbitBy(x * 0.05, y * 0.05, true);
      if (z) zoomBy(1 + z * 0.02);

      const edge = (i: number, fn: () => void) => {
        const down = !!pad.buttons[i]?.pressed;
        if (down && !padDown[i]) fn();
        padDown[i] = down;
      };
      edge(0, toggleRotate);
      edge(1, resetView);
      edge(4, () => void stepArtefact(-1));
      edge(5, () => void stepArtefact(1));
    }
  }
  raf = requestAnimationFrame(pollPad);
}
const startPad = () => {
  if (!raf) raf = requestAnimationFrame(pollPad);
};
const stopPad = () => {
  if (Array.from(navigator.getGamepads?.() ?? []).some(Boolean)) return;
  cancelAnimationFrame(raf);
  raf = 0;
};
function onVisibility() {
  if (document.hidden && raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  } else if (
    !document.hidden &&
    Array.from(navigator.getGamepads?.() ?? []).some(Boolean)
  ) {
    startPad();
  }
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

onMounted(() => {
  readMuteState();
  detectReducedMotion();

  window.addEventListener("keydown", onKey, true);
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("gamepadconnected", startPad);
  window.addEventListener("gamepaddisconnected", stopPad);

  unlockAudio();
  checkCart();
  store.clearCurrent();
});

onBeforeUnmount(() => {
  thumbsReq++;
  if (searchTimer) clearTimeout(searchTimer);
  window.removeEventListener("keydown", onKey, true);
  document.removeEventListener("fullscreenchange", onFsChange);
  document.removeEventListener("visibilitychange", onVisibility);
  window.removeEventListener("gamepadconnected", startPad);
  window.removeEventListener("gamepaddisconnected", stopPad);
  reducedMq?.removeEventListener?.("change", onReducedChange);
  cancelAnimationFrame(raf);

  if (audioCtx) {
    void audioCtx.close().catch(() => undefined);
    audioCtx = null;
  }
});

/* ------------------------------------------------------------------ */
/* Kick-off                                                            */
/* ------------------------------------------------------------------ */

void enterGate();
void import("@google/model-viewer");
void store.fetchTaxonomy().catch(() => {});
void loadThumbs();
</script>

<style scoped>
/* ~20% custom CSS: layout glue, the 3D stage, and small touches. */

.explorer {
  position: relative;
  height: 100dvh;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}
/* Phones/tablets: full-screen app surface above site chrome. */
.explorer--compact {
  position: fixed;
  inset: 0;
  z-index: 1000;
}
@media (min-width: 960px) {
  .explorer:not(.explorer--compact) {
    height: 97vh;
  }
}

.explorer__main {
  display: flex;
}
.explorer__col {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.explorer__desc {
  white-space: pre-line;
  line-height: 1.6;
}
.explorer__kbd {
  font: inherit;
  font-size: 0.75rem;
  padding: 1px 6px;
  border: thin solid rgba(var(--v-border-color), 0.4);
  border-radius: 4px;
}
.tabular {
  font-variant-numeric: tabular-nums;
}
.pulse {
  animation: explorer-pulse 1s ease-in-out infinite;
}
@keyframes explorer-pulse {
  50% {
    opacity: 0.55;
  }
}

/* ---------------- 3D stage ---------------- */
.stage {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(ellipse at 50% 40%, #232830 0%, #0d0f12 75%);
}
.stage--light {
  color: #111;
  background: radial-gradient(ellipse at 50% 40%, #ffffff 0%, #d5d9df 80%);
}
.stage--pseudo-fs {
  position: fixed;
  inset: 0;
  z-index: 3000;
}
.stage__viewer,
.stage__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.stage__viewer {
  background: transparent;
  --poster-color: transparent;
  --progress-bar-color: transparent; /* we draw our own progress */
}
.stage__poster {
  opacity: 0.45;
  filter: blur(6px);
  pointer-events: none;
}
.stage__status {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  opacity: 0.85;
  pointer-events: none;
}
.stage__alert {
  position: absolute;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  max-width: 92%;
}
.stage__top {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 28px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}
.stage__glass {
  background: rgba(14, 16, 20, 0.62) !important;
  color: #fff !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.stage__nav {
  position: absolute !important;
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
}
.stage__nav--prev {
  left: 8px;
}
.stage__nav--next {
  right: 8px;
}
.stage__controls {
  position: absolute;
  left: 50%;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  z-index: 3;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
}
.stage__controls :deep(.v-btn) {
  color: #fff;
}
.stage__progress {
  position: absolute !important;
  inset: auto 0 0 0;
  z-index: 3;
}

/* ---------------- Filmstrip ---------------- */
.thumb {
  flex: 0 0 auto;
  width: 112px;
}
.thumb--active {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 1px;
}
.thumb__none {
  aspect-ratio: 4 / 3;
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.thumb--more {
  height: auto !important;
  align-self: stretch;
}
@media (min-width: 960px) {
  .thumb {
    width: 136px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
  }
}
</style>
