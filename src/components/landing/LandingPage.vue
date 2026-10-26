<!-- ================================================================== -->
<!-- src/pages/KMTHeritageMuseum.vue (MAIN PAGE)                        -->
<!-- ================================================================== -->
<template>
  <v-app>
    <!-- ===== MODERN APP BAR ===== -->
    <v-app-bar flat height="72" class="app-bar px-4 px-md-6" elevation="0" app>
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

      <!-- Logo -->
      <div class="d-none d-md-flex logo-container">
        <div class="logo-badge">
          <v-icon size="28" color="white">mdi-bank</v-icon>
        </div>
        <div class="logo-text ml-3">
          <div class="logo-main">TUKEMA</div>
          <div class="logo-sub">Virtual Museum</div>
        </div>
      </div>

      <v-spacer />

      <!-- Desktop Navigation -->
      <div class="desktop-nav d-none d-md-flex align-center">
        <v-btn
          v-for="item in navItems"
          :key="item.id"
          variant="text"
          class="nav-link"
          :class="{ active: activeSection === item.id }"
          @click="scrollToSection(item.id)"
        >
          {{ item.text }}
          <span class="nav-underline"></span>
        </v-btn>
        <v-btn class="get-started-btn ml-4" @click="openApp" elevation="0" rounded="pill">
          Enter Museum
          <v-icon end size="18">mdi-door-open</v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- MOBILE DRAWER -->
    <v-navigation-drawer v-model="drawer" temporary location="right" width="300">
      <div class="drawer-header pa-4">
        <div class="logo-text">
          <div class="logo-main">TUKEMA</div>
          <div class="logo-sub">Virtual Museum</div>
        </div>
        <v-btn icon @click="drawer = false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
      <v-divider />
      <v-list density="comfortable">
        <v-list-item
          v-for="item in navItems"
          :key="item.id"
          @click="
            scrollToSection(item.id);
            drawer = false;
          "
          class="mobile-nav-item"
        >
          <template #prepend>
            <v-icon color="primary">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
        <v-divider class="my-2" />
        <v-list-item
          @click="
            openApp();
            drawer = false;
          "
          class="mobile-cta-item"
        >
          <template #prepend>
            <v-icon color="accent">mdi-door-open</v-icon>
          </template>
          <v-list-item-title class="text-accent font-weight-bold"
            >Enter Museum</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- MAIN CONTENT -->
    <v-main class="app-main">
      <!-- ============ HERO SECTION ============ -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <v-container class="hero-content">
          <v-row align="center" justify="center">
            <v-col cols="12" md="10" lg="8" class="text-center">
              <div class="hero-badge mb-6">
                <v-icon size="16" color="accent">mdi-earth</v-icon>
                <span>Preserving Heritage Since Time Immemorial</span>
              </div>
              <h1 class="hero-title">
                The Living Heritage of the
                <span class="highlight">Keiyo, Marakwet &amp; Tugen</span>
              </h1>
              <p class="hero-subtitle">
                Step into a digital sanctuary where the stories, songs, artifacts, and
                wisdom of the Kalenjin highlands are preserved for generations to come.
                Explore our virtual galleries, oral histories, and cultural treasures.
              </p>
              <div class="hero-actions">
                <v-btn
                  size="large"
                  rounded="pill"
                  class="hero-primary-btn"
                  @click="scrollToSection('galleries')"
                >
                  Explore Galleries
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn
                  size="large"
                  rounded="pill"
                  variant="outlined"
                  class="hero-secondary-btn"
                  @click="scrollToSection('oral-history')"
                >
                  <v-icon start>mdi-play-circle</v-icon>
                  Listen to Stories
                </v-btn>
              </div>

              <div class="hero-stats mt-12">
                <div class="stat-item" v-for="stat in heroStats" :key="stat.label">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>

        <div class="scroll-indicator">
          <v-icon color="white" size="28">mdi-chevron-down</v-icon>
        </div>
      </section>

      <!-- ============ ABOUT / INTRO SECTION ============ -->
      <section id="about" class="intro-section py-16 py-md-20">
        <v-container>
          <v-row align="center" justify="center">
            <v-col cols="12" md="5" class="text-center text-md-left">
              <div class="section-label">About the Museum</div>
              <h2 class="section-title">
                A Digital Home for <br />
                <span class="highlight">Living Heritage</span>
              </h2>
              <p class="section-text">
                The Keiyo, Marakwet, and Tugen communities are the three sub-groups of
                the Kalenjin people who have called the Kerio Valley and the
                Elgeyo-Marakwet highlands home for centuries. Our virtual museum is a
                community-led initiative to digitize, preserve, and share the rich
                cultural heritage of these highland communities — from the striking
                <em>kerio</em> valley landscapes to the intricate
                <em>sirikwa</em> initiation rites, the legendary
                <em>cheptilet</em> iron-working, and the enduring wisdom of our elders.
              </p>
              <p class="section-text">
                Every artifact, song, and story in this museum has been shared with the
                free, prior, and informed consent of community custodians. We honor the
                principle that heritage belongs to the living communities who created
                it.
              </p>
              <v-btn
                rounded="pill"
                class="mt-4 intro-btn"
                @click="scrollToSection('communities')"
              >
                Meet the Communities
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>

            <v-col cols="12" md="6" class="offset-md-1 mt-8 mt-md-0">
              <div class="heritage-grid">
                <div
                  v-for="(card, i) in heritageCards"
                  :key="i"
                  class="heritage-card"
                  :class="`card-${i + 1}`"
                >
                  <v-icon size="36" :color="card.color">{{ card.icon }}</v-icon>
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.text }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ COMMUNITIES SECTION ============ -->
      <section id="communities" class="communities-section py-16 py-md-20">
        <v-container>
          <div class="text-center mb-12">
            <div class="section-label">Three Peoples, One Heritage</div>
            <h2 class="section-title">The Communities</h2>
            <p class="section-intro">
              The Keiyo, Marakwet, and Tugen share the Kalenjin language family, the
              highland landscapes of the Kerio Valley, and a deep tradition of
              <em>tumdo</em> (customary law), age-sets, and community stewardship.
            </p>
          </div>

          <v-row>
            <v-col v-for="(community, i) in communities" :key="i" cols="12" md="4">
              <div class="community-card" :style="{ '--accent': community.accent }">
                <div class="community-banner" :style="{ background: community.gradient }">
                  <v-icon size="48" color="white">{{ community.icon }}</v-icon>
                </div>
                <div class="community-body">
                  <h3 class="community-name">{{ community.name }}</h3>
                  <div class="community-aka">{{ community.aka }}</div>
                  <p class="community-desc" v-html="community.desc"></p>
                  <div class="community-tags">
                    <v-chip
                      v-for="tag in community.tags"
                      :key="tag"
                      size="small"
                      class="tag-chip"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ GALLERIES SECTION ============ -->
      <section id="galleries" class="galleries-section py-16 py-md-20">
        <v-container>
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-md-end mb-12"
          >
            <div>
              <div class="section-label">Explore</div>
              <h2 class="section-title">Virtual Galleries</h2>
            </div>
            <v-btn
              variant="outlined"
              rounded="pill"
              class="mt-4 mt-md-0 gallery-all-btn"
              @click="scrollToSection('artifacts')"
            >
              View All Artifacts
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>

          <v-row>
            <v-col v-for="(gallery, i) in galleries" :key="i" cols="12" sm="6" md="4">
              <div class="gallery-card">
                <!-- Image area: <img> with fallback -->
                <div class="gallery-image">
                  <img
                    v-if="gallery.image"
                    :src="gallery.image"
                    :alt="gallery.title"
                    loading="lazy"
                    class="gallery-img"
                  />
                  <div v-else class="gallery-placeholder">
                    <v-icon size="40" color="#8b4513">mdi-image-off-outline</v-icon>
                  </div>

                  <div class="gallery-overlay">
                    <v-chip size="small" class="gallery-chip">
                      {{ gallery.category }}
                    </v-chip>
                  </div>
                </div>

                <div class="gallery-body">
                  <h3 class="gallery-title">{{ gallery.title }}</h3>
                  <p class="gallery-desc" v-html="gallery.desc"></p>

                  <div class="gallery-footer">
                    <span class="gallery-count">
                      <v-icon size="16" color="accent">mdi-image-multiple</v-icon>
                      {{ gallery.count }} items
                    </span>

                    <v-btn
                      icon
                      size="small"
                      class="gallery-arrow"
                      :aria-label="`Explore ${gallery.title}`"
                    >
                      <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ ARTIFACTS SECTION ============ -->
      <section id="artifacts" class="artifacts-section py-16 py-md-20">
        <v-container>
          <div class="text-center mb-12">
            <div class="section-label">Cultural Treasures</div>
            <h2 class="section-title">Featured Artifacts</h2>
            <p class="section-intro">
              Each object carries the memory of the hands that made it and the
              community that used it.
            </p>
          </div>

          <v-row>
            <v-col v-for="(artifact, i) in artifacts" :key="i" cols="6" sm="4" md="3">
              <div class="artifact-card">
                <div class="artifact-image">
                  <v-icon size="48" color="white">{{ artifact.icon }}</v-icon>
                </div>
                <h4 class="artifact-name">{{ artifact.name }}</h4>
                <p class="artifact-origin">{{ artifact.origin }}</p>
                <div class="artifact-meta">
                  <v-chip size="x-small" class="meta-chip">{{ artifact.material }}</v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ ORAL HISTORY SECTION ============ -->
      <section id="oral-history" class="oral-section py-16 py-md-20">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6">
              <div class="section-label">Voices of the Elders</div>
              <h2 class="section-title">
                Oral History <br />
                <span class="highlight">Preservation</span>
              </h2>
              <p class="section-text">
                In our communities, history lives in the voices of the elders. The
                <em>kokwet</em> — the traditional council of elders — has long served as
                the living archive of our people. Our oral history program records,
                translates, and archives elder testimony, folktales, proverbs, and
                origin narratives in both Kalenjin and English.
              </p>
              <p class="section-text">
                Each recording is made with the full consent of the speaker and the
                community, and is attributed to the individual and the
                <em>kokwet</em> that authorized it.
              </p>
              <v-btn
                rounded="pill"
                class="mt-4 oral-btn"
                @click="scrollToSection('initiatives')"
              >
                <v-icon start>mdi-microphone</v-icon>
                Explore Oral Archives
              </v-btn>
            </v-col>

            <v-col cols="12" md="6" class="mt-8 mt-md-0">
              <div class="audio-feature">
                <div class="audio-header">
                  <v-icon size="20" color="accent">mdi-waveform</v-icon>
                  <span>Featured Recording</span>
                </div>
                <div class="audio-card" v-for="(clip, i) in clips" :key="i">
                  <v-btn icon class="play-btn" size="small">
                    <v-icon color="white">mdi-play</v-icon>
                  </v-btn>
                  <div class="audio-info">
                    <div class="audio-title">{{ clip.title }}</div>
                    <div class="audio-meta">{{ clip.speaker }} · {{ clip.duration }}</div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ INITIATIVES SECTION ============ -->
      <section id="initiatives" class="initiatives-section py-16 py-md-20">
        <v-container>
          <div class="text-center mb-12">
            <div class="section-label">Our Work</div>
            <h2 class="section-title">Preservation Initiatives</h2>
            <p class="section-intro">
              Community-led programs that keep our heritage alive and accessible.
            </p>
          </div>

          <v-row>
            <v-col v-for="(item, i) in initiatives" :key="i" cols="12" md="4">
              <div class="initiative-card">
                <div class="initiative-icon">
                  <v-icon size="32" color="white">{{ item.icon }}</v-icon>
                </div>
                <h3 class="initiative-title">{{ item.title }}</h3>
                <p class="initiative-desc" v-html="item.desc"></p>
                <div class="initiative-progress">
                  <div class="progress-labels">
                    <span>{{ item.label }}</span>
                    <span>{{ item.progress }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="item.progress"
                    color="accent"
                    bg-color="rgba(139, 69, 19, 0.15)"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ VISIT SECTION ============ -->
      <section id="visit" class="visit-section py-16 py-md-20">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="6">
              <div class="section-label light">Plan Your Visit</div>
              <h2 class="section-title light">
                Step Into the <br />
                <span class="highlight">Virtual Museum</span>
              </h2>
              <p class="section-text light">
                The museum is free to explore, and every gallery is designed with the
                community's consent and guidance. Whether you are a researcher, a
                student, a community member, or a curious visitor, there is a story here
                for you.
              </p>
              <div class="visit-actions">
                <v-btn
                  size="large"
                  rounded="pill"
                  class="visit-primary-btn"
                  @click="openApp"
                >
                  Enter the Museum
                  <v-icon end>mdi-door-open</v-icon>
                </v-btn>
                <v-btn
                  size="large"
                  rounded="pill"
                  variant="outlined"
                  class="visit-secondary-btn"
                >
                  <v-icon start>mdi-calendar</v-icon>
                  Book a Guided Tour
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="mt-8 mt-md-0">
              <div class="visit-info-grid">
                <div class="visit-info-card" v-for="(info, i) in visitInfo" :key="i">
                  <v-icon size="28" :color="info.color">{{ info.icon }}</v-icon>
                  <h4>{{ info.title }}</h4>
                  <p>{{ info.text }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ============ FOOTER ============ -->
      <footer class="museum-footer">
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <div class="footer-brand">
                <div class="footer-badge">
                  <v-icon size="24" color="white">mdi-bank</v-icon>
                </div>
                <div>
                  <div class="footer-title">TUKEMA</div>
                  <div class="footer-sub">Virtual Museum</div>
                </div>
              </div>
              <p class="footer-desc">
                A community-led digital sanctuary preserving the living heritage of the
                Keiyo, Marakwet, and Tugen peoples of the Kalenjin highlands.
              </p>
              <div class="footer-social">
                <v-btn
                  v-for="icon in socialIcons"
                  :key="icon"
                  icon
                  size="small"
                  class="social-btn"
                >
                  <v-icon size="18">{{ icon }}</v-icon>
                </v-btn>
              </div>
            </v-col>

            <v-col v-for="(col, i) in footerCols" :key="i" cols="6" md="2">
              <h4 class="footer-heading">{{ col.title }}</h4>
              <ul class="footer-links">
                <li v-for="link in col.links" :key="link">
                  <a href="#" class="footer-link">{{ link }}</a>
                </li>
              </ul>
            </v-col>

            <v-col cols="12" md="2">
              <h4 class="footer-heading">Contact</h4>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">hello@kmtheritage.org</a></li>
                <li><a href="#" class="footer-link">Kerio Valley, Kenya</a></li>
                <li><a href="#" class="footer-link">Community Office</a></li>
              </ul>
            </v-col>
          </v-row>

          <v-divider class="footer-divider my-8" />

          <div class="footer-bottom">
            <span
              >© {{ new Date().getFullYear() }} TUKEMA Virtual Museum. All rights
              reserved.</span
            >
            <span class="footer-consent"
              >Built with the free, prior, and informed consent of community
              custodians.</span
            >
          </div>
        </v-container>
      </footer>
    </v-main>

    <!-- SCROLL TOP BUTTON -->
    <v-fab-transition>
      <v-btn
        v-show="showScrollTop"
        class="scroll-top-btn"
        color="primary"
        fab
        size="48"
        @click="scrollToTop"
        elevation="4"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const drawer = ref(false);
const showScrollTop = ref(false);
const activeSection = ref("");

const navItems = [
  { id: "about", text: "Our Heritage", icon: "mdi-history" },
  { id: "communities", text: "Communities", icon: "mdi-account-group" },
  { id: "galleries", text: "Galleries", icon: "mdi-image-multiple" },
  { id: "artifacts", text: "Artifacts", icon: "mdi-shield-outline" },
  { id: "oral-history", text: "Oral History", icon: "mdi-microphone" },
  { id: "initiatives", text: "Initiatives", icon: "mdi-hand-heart" },
  { id: "visit", text: "Plan Visit", icon: "mdi-map-marker" },
];

const heroStats = [
  { value: "3", label: "Communities" },
  { value: "500+", label: "Artifacts" },
  { value: "120+", label: "Oral Histories" },
  { value: "40+", label: "Virtual Galleries" },
];

const heritageCards = [
  {
    icon: "mdi-shield-star",
    color: "#8b4513",
    title: "Artifacts",
    text: "Traditional tools, weapons, beadwork, and ceremonial regalia.",
  },
  {
    icon: "mdi-account-voice",
    color: "#f08228",
    title: "Oral Histories",
    text: "Elder testimony, folktales, proverbs, and origin narratives.",
  },
  {
    icon: "mdi-palette",
    color: "#8b4513",
    title: "Living Arts",
    text: "Song, dance, and the visual traditions of the highlands.",
  },
  {
    icon: "mdi-terrain",
    color: "#f08228",
    title: "Sacred Landscapes",
    text: "Kerio Valley, Elgeyo escarpment, and community sacred sites.",
  },
];

const communities = [
  {
    name: "Keiyo",
    aka: "Elgeyo",
    icon: "mdi-mountain",
    accent: "#8b4513",
    gradient: "linear-gradient(135deg, #8b4513, #a0522d)",
    desc: "Guardians of the Elgeyo escarpment and the Kerio Valley floor. Renowned for their honey, cattle-keeping traditions, and the dramatic highland landscapes they call home.",
    tags: ["Kerio Valley", "Honey", "Escarpment"],
  },
  {
    name: "Marakwet",
    aka: "Endo",
    icon: "mdi-water",
    accent: "#f08228",
    gradient: "linear-gradient(135deg, #f08228, #d4691a)",
    desc: "Celebrated for the ancient <em>sirikwa</em> irrigation furrows that still water their terraced fields, and for a rich tradition of iron-working and pottery.",
    tags: ["Irrigation", "Iron-working", "Terraces"],
  },
  {
    name: "Tugen",
    aka: "Tugen",
    icon: "mdi-forest",
    accent: "#2b2b2b",
    gradient: "linear-gradient(135deg, #2b2b2b, #4a4a4a)",
    desc: "Custodians of the Tugen Hills and the Kerio Valley's southern reaches. Their oral traditions preserve the memory of the <em>Sirikwa</em> and the deep history of the Rift.",
    tags: ["Tugen Hills", "Oral History", "Rift Valley"],
  },
];

/**
 * Gallery image loader — FIXED.
 * - Uses a glob path relative to this module (Vite requirement).
 * - Matches by filename suffix so keys resolve regardless of the exact prefix.
 */
const galleryImages = import.meta.glob(
  "../../assets/galleries/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
) as Record<string, string>;

const getGalleryImage = (filename: string): string => {
  const key = Object.keys(galleryImages).find((k) =>
    k.toLowerCase().endsWith(`/galleries/${filename.toLowerCase()}`),
  );

  if (!key) {
    console.warn(
      `[TUKEMA] Gallery image not found: ${filename}. ` +
        `Ensure it exists in src/assets/galleries/. Available:`,
      Object.keys(galleryImages),
    );
    return "";
  }

  return galleryImages[key];
};

const galleries = [
  {
    title: "Initiation & Rites of Passage",
    category: "Ceremony",
    image: getGalleryImage("initiation.jpeg"),
    desc: "Tugen, Keiyo, and Marakwet age-set ceremonies, including the <em>sirikwa</em> traditions.",
    count: 48,
  },
  {
    title: "Iron Working & Smithing",
    category: "Craft",
    image: getGalleryImage("smith.webp"),
    desc: "The legendary <em>cheptilet</em> iron smelting traditions of the Marakwet.",
    count: 32,
  },
  {
    title: "Beadwork & Adornment",
    category: "Regalia",
    image: getGalleryImage("beadwork.jpg"),
    desc: "Colorful beadwork, necklaces, and ceremonial adornments of the highlands.",
    count: 64,
  },
  {
    title: "Irrigation Furrows",
    category: "Landscape",
    image: getGalleryImage("irrigation.jpg"),
    desc: "The ancient <em>sirikwa</em> furrows that still water the Marakwet terraces.",
    count: 28,
  },
  {
    title: "Music & Dance",
    category: "Performance",
    image: getGalleryImage("music-dance.jpg"),
    desc: "Traditional instruments, songs, and dances performed at community gatherings.",
    count: 41,
  },
  {
    title: "Sacred Landscapes",
    category: "Landscape",
    image: getGalleryImage("sacred-landscapes.jpg"),
    desc: "The Kerio Valley, Tugen Hills, and Elgeyo escarpment, living cultural landscapes.",
    count: 36,
  },
];

const artifacts = [
  { name: "Cheptilet Bellows", origin: "Marakwet", material: "Iron, Hide", icon: "mdi-bell" },
  { name: "Sirikwa Furrow Shovel", origin: "Marakwet", material: "Wood, Iron", icon: "mdi-shovel" },
  { name: "Kelelwa Belt", origin: "Keiyo", material: "Beads, Leather", icon: "mdi-necklace" },
  { name: "Tugen Honey Pot", origin: "Tugen", material: "Clay", icon: "mdi-pot" },
  { name: "Ceremonial Spear", origin: "Keiyo", material: "Iron, Wood", icon: "mdi-sword" },
  { name: "Tugen Milk Gourd", origin: "Tugen", material: "Gourd", icon: "mdi-bowl" },
  { name: "Marakwet Winnowing Basket", origin: "Marakwet", material: "Reed", icon: "mdi-basket" },
  { name: "Age-Set Regalia", origin: "All", material: "Beads, Hide", icon: "mdi-account-star" },
];

const clips = [
  { title: "The Origin of the Sirikwa Furrows", speaker: "Elder Kipchumba", duration: "6:42" },
  { title: "Tugen Creation Narrative", speaker: "Elder Chebet", duration: "9:15" },
  { title: "The Cheptilet Iron-Smiting Song", speaker: "Elder Cheruiyot", duration: "4:28" },
  { title: "Marakwet Initiation Rites", speaker: "Elder Kimutai", duration: "8:03" },
];

const initiatives = [
  {
    icon: "mdi-database",
    title: "Digital Archive",
    desc: "Digitizing artifacts, photographs, and recordings into a secure, community-governed archive.",
    label: "Catalogued",
    progress: 72,
  },
  {
    icon: "mdi-account-voice",
    title: "Elder Recording Program",
    desc: "Recording and translating elder testimony in Kalenjin and English, with full consent and attribution.",
    label: "Recordings",
    progress: 58,
  },
  {
    icon: "mdi-school",
    title: "Youth Cultural Education",
    desc: "Workshops and curricula that connect young people to their language, history, and traditions.",
    label: "Reach",
    progress: 45,
  },
  {
    icon: "mdi-handshake",
    title: "Community Custodianship",
    desc: "Formal agreements with <em>kokwet</em> councils to govern access, use, and benefit-sharing.",
    label: "Agreements",
    progress: 85,
  },
  {
    icon: "mdi-translate",
    title: "Language Preservation",
    desc: "Documenting Kalenjin dialects, proverbs, and place names for future generations.",
    label: "Documented",
    progress: 63,
  },
  {
    icon: "mdi-forest",
    title: "Sacred Sites Mapping",
    desc: "Community-led mapping of sacred landscapes and cultural heritage sites across the highlands.",
    label: "Mapped",
    progress: 40,
  },
];

const visitInfo = [
  {
    icon: "mdi-clock-outline",
    color: "#f08228",
    title: "Open Online",
    text: "The virtual museum is accessible 24/7 from anywhere in the world.",
  },
  {
    icon: "mdi-account-group",
    color: "#f08228",
    title: "Guided Tours",
    text: "Book a live, community-led virtual tour with a heritage guide.",
  },
  {
    icon: "mdi-school",
    color: "#f08228",
    title: "School Programs",
    text: "Curriculum-aligned visits and resources for schools and universities.",
  },
  {
    icon: "mdi-hand-heart",
    color: "#f08228",
    title: "Community Access",
    text: "Free access for community members and cultural practitioners.",
  },
];

const socialIcons = ["mdi-facebook", "mdi-twitter", "mdi-instagram", "mdi-youtube"];

const footerCols = [
  {
    title: "Explore",
    links: ["Our Heritage", "Communities", "Galleries", "Artifacts"],
  },
  {
    title: "Learn",
    links: ["Oral History", "Research", "Education", "Resources"],
  },
  {
    title: "Support",
    links: ["Initiatives", "Donate", "Volunteer", "Partnerships"],
  },
];

const openApp = () => {
  window.location.href = "/museum/explore";
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 80;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: "smooth" });
  activeSection.value = id;
  drawer.value = false;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 350;

  const scrollPos = window.scrollY + 140;
  let current = navItems[0]?.id || "";

  for (const item of navItems) {
    const section = document.getElementById(item.id);
    if (section && section.offsetTop <= scrollPos) {
      current = item.id;
    }
  }

  activeSection.value = current;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));
</script>

<style scoped>
/* ===== FONT IMPORTS ===== */
@import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap");

/* ===== GLOBAL ===== */
.app-main {
  background: #f5efe6;
  padding-top: 72px;
}

.app-bar {
  background: rgba(245, 239, 230, 0.98) !important;
  backdrop-filter: blur(12px);
  border-bottom: 2px solid rgba(139, 69, 19, 0.15);
  position: fixed !important;
  top: 0 !important;
  z-index: 1000 !important;
}

.logo-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b4513, #f08228);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.25);
}

.logo-text {
  font-family: "Cormorant Garamond", serif;
}

.logo-main {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2b2b2b;
  letter-spacing: -0.3px;
  line-height: 1.1;
}

.logo-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: #8b4513;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: "Inter", sans-serif;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-link {
  position: relative;
  text-transform: none;
  font-weight: 500;
  font-size: 0.92rem;
  color: #4a3f35;
  padding: 0 14px;
  min-height: 44px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.nav-link:hover {
  color: #8b4513;
  background: rgba(139, 69, 19, 0.06);
  transform: translateY(-1px);
}

.nav-link.active {
  color: #8b4513;
  font-weight: 600;
  background: rgba(139, 69, 19, 0.08);
}

.nav-underline {
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #8b4513, #f08228);
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.nav-link:hover .nav-underline,
.nav-link.active .nav-underline {
  width: calc(100% - 24px);
}

.get-started-btn {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  color: white;
  font-weight: 600;
  text-transform: none;
  padding: 0 28px;
  height: 44px;
  border-radius: 60px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.25);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

.get-started-btn:hover {
  background: linear-gradient(135deg, #6b3410, #8b4513);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.get-started-btn .v-icon {
  transition: transform 0.3s ease;
}

.get-started-btn:hover .v-icon {
  transform: translateX(4px);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5efe6, #ede3d3);
}

.mobile-nav-item {
  border-radius: 10px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.mobile-nav-item:hover {
  background: rgba(139, 69, 19, 0.06);
  transform: translateX(4px);
}

.mobile-cta-item {
  border-radius: 10px;
  margin: 2px 8px;
  background: rgba(240, 130, 40, 0.1);
  transition: all 0.2s ease;
}

.mobile-cta-item:hover {
  background: rgba(240, 130, 40, 0.18);
  transform: translateX(4px);
}

.scroll-top-btn {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  background: linear-gradient(135deg, #8b4513, #f08228) !important;
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.35) !important;
  transition: all 0.3s ease !important;
}

.scroll-top-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 28px rgba(139, 69, 19, 0.5) !important;
}

/* ===== HERO ===== */
.hero-section {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 50%, #3d2817 100%);
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920");
  background-size: cover;
  background-position: center;
  opacity: 0.25;
  mix-blend-mode: luminosity;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(26, 26, 26, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 100px 24px 60px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(240, 130, 40, 0.15);
  border: 1px solid rgba(240, 130, 40, 0.4);
  border-radius: 60px;
  color: #f08228;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 700;
  color: #f5efe6;
  line-height: 1.15;
  margin-bottom: 24px;
}

.hero-title .highlight {
  color: #f08228;
  position: relative;
  display: inline-block;
}

.hero-title .highlight::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 8px;
  background: rgba(240, 130, 40, 0.25);
  border-radius: 4px;
  z-index: -1;
}

.hero-subtitle {
  font-family: "Inter", sans-serif;
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  color: rgba(245, 239, 230, 0.8);
  line-height: 1.75;
  max-width: 720px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-primary-btn {
  background: linear-gradient(135deg, #8b4513, #f08228) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0 32px !important;
  height: 52px !important;
  font-size: 1rem !important;
  box-shadow: 0 6px 24px rgba(240, 130, 40, 0.35) !important;
  transition: all 0.3s ease !important;
}

.hero-primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(240, 130, 40, 0.5) !important;
}

.hero-secondary-btn {
  color: #f5efe6 !important;
  border-color: rgba(245, 239, 230, 0.4) !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 0 28px !important;
  height: 52px !important;
  font-size: 1rem !important;
}

.hero-secondary-btn:hover {
  background: rgba(245, 239, 230, 0.1) !important;
  border-color: #f5efe6 !important;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #f08228;
  line-height: 1;
}

.stat-label {
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: rgba(245, 239, 230, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 6px;
}

.scroll-indicator {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  z-index: 2;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

/* ===== SHARED SECTION STYLES ===== */
.section-label {
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #f08228;
  margin-bottom: 12px;
}

.section-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 700;
  color: #2b2b2b;
  line-height: 1.2;
  margin-bottom: 20px;
}

.section-title .highlight {
  color: #8b4513;
}

.section-text {
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  color: #5a4a3a;
  line-height: 1.75;
  margin-bottom: 16px;
}

.section-intro {
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  color: #6b5a48;
  line-height: 1.7;
  max-width: 720px;
  margin: 0 auto;
}

/* ===== INTRO ===== */
.intro-section {
  background: #f5efe6;
}

.intro-btn {
  background: linear-gradient(135deg, #8b4513, #a0522d) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0 28px !important;
  height: 46px !important;
}

.heritage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.heritage-card {
  background: white;
  border-radius: 16px;
  padding: 28px 22px;
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.08);
  border-top: 3px solid #8b4513;
  transition: all 0.3s ease;
}

.heritage-card:nth-child(even) {
  border-top-color: #f08228;
  transform: translateY(24px);
}

.heritage-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(139, 69, 19, 0.16);
}

.heritage-card:nth-child(even):hover {
  transform: translateY(18px);
}

.heritage-card h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2b2b2b;
  margin: 12px 0 8px;
}

.heritage-card p {
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #6b5a48;
  line-height: 1.6;
}

/* ===== COMMUNITIES ===== */
.communities-section {
  background: #ffffff;
}

.community-card {
  background: #f5efe6;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(43, 43, 43, 0.08);
  transition: all 0.35s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.community-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(43, 43, 43, 0.18);
}

.community-banner {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.community-banner::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 12px,
    rgba(255, 255, 255, 0.05) 12px,
    rgba(255, 255, 255, 0.05) 24px
  );
}

.community-body {
  padding: 24px 22px 28px;
  flex: 1;
}

.community-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #2b2b2b;
  margin-bottom: 2px;
}

.community-aka {
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--accent);
  margin-bottom: 14px;
}

.community-desc {
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  color: #5a4a3a;
  line-height: 1.7;
  margin-bottom: 18px;
}

.community-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  background: rgba(139, 69, 19, 0.1) !important;
  color: #8b4513 !important;
  font-family: "Inter", sans-serif !important;
  font-weight: 500 !important;
}

/* ===== GALLERIES ===== */
.galleries-section {
  background: #f5efe6;
}

.gallery-all-btn {
  color: #8b4513 !important;
  border-color: #8b4513 !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 0 24px !important;
  height: 44px !important;
}

.gallery-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(43, 43, 43, 0.08);
  transition: all 0.35s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(43, 43, 43, 0.16);
}

/* Fixed image container */
.gallery-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8ddd0, #d4c4b0);
  border-radius: 18px 18px 0 0;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-card:hover .gallery-img {
  transform: scale(1.05);
}

.gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8ddd0, #d4c4b0);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
  background: linear-gradient(
    to bottom,
    rgb(0 0 0 / 25%),
    transparent 45%,
    rgb(0 0 0 / 10%)
  );
  pointer-events: none;
}

.gallery-chip {
  background: rgba(240, 130, 40, 0.95) !important;
  color: white !important;
  font-family: "Inter", sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.72rem !important;
  pointer-events: auto;
}

.gallery-body {
  padding: 20px 20px 22px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gallery-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2b2b2b;
  margin: 0 0 8px;
  line-height: 1.3;
}

.gallery-desc {
  font-family: "Inter", sans-serif;
  font-size: 0.87rem;
  color: #6b5a48;
  line-height: 1.6;
  flex: 1;
  margin: 0 0 14px;
}

.gallery-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.gallery-count {
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  color: #8b4513;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.gallery-arrow {
  background: rgba(139, 69, 19, 0.08) !important;
  color: #8b4513 !important;
  transition: all 0.3s ease !important;
}

.gallery-card:hover .gallery-arrow {
  background: #8b4513 !important;
  color: white !important;
}

/* ===== ARTIFACTS ===== */
.artifacts-section {
  background: #ffffff;
}

.artifact-card {
  background: #f5efe6;
  border-radius: 16px;
  padding: 24px 16px 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 69, 19, 0.08);
  height: 100%;
}

.artifact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.25);
}

.artifact-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b4513, #a0522d);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.25);
}

.artifact-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2b2b2b;
  margin-bottom: 4px;
  line-height: 1.3;
}

.artifact-origin {
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #f08228;
  margin-bottom: 10px;
}

.meta-chip {
  background: rgba(139, 69, 19, 0.1) !important;
  color: #8b4513 !important;
  font-family: "Inter", sans-serif !important;
}

/* ===== ORAL HISTORY ===== */
.oral-section {
  background: #2b2b2b;
}

.oral-section .section-title {
  color: #f5efe6;
}

.oral-section .section-title .highlight {
  color: #f08228;
}

.oral-section .section-text {
  color: rgba(245, 239, 230, 0.75);
}

.oral-btn {
  background: linear-gradient(135deg, #f08228, #d4691a) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0 28px !important;
  height: 46px !important;
}

.audio-feature {
  background: rgba(245, 239, 230, 0.05);
  border: 1px solid rgba(240, 130, 40, 0.2);
  border-radius: 20px;
  padding: 28px 24px;
}

.audio-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #f08228;
  margin-bottom: 20px;
}

.audio-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  transition: background 0.25s ease;
  cursor: pointer;
}

.audio-card:hover {
  background: rgba(240, 130, 40, 0.08);
}

.audio-card + .audio-card {
  border-top: 1px solid rgba(245, 239, 230, 0.08);
}

.play-btn {
  background: linear-gradient(135deg, #8b4513, #f08228) !important;
  flex-shrink: 0;
}

.audio-info {
  flex: 1;
}

.audio-title {
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  font-weight: 600;
  color: #f5efe6;
  margin-bottom: 2px;
}

.audio-meta {
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: rgba(245, 239, 230, 0.55);
}

/* ===== INITIATIVES ===== */
.initiatives-section {
  background: #f5efe6;
}

.initiative-card {
  background: white;
  border-radius: 18px;
  padding: 28px 24px;
  box-shadow: 0 4px 20px rgba(43, 43, 43, 0.06);
  transition: all 0.3s ease;
  height: 100%;
}

.initiative-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(43, 43, 43, 0.12);
}

.initiative-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #8b4513, #f08228);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  box-shadow: 0 4px 14px rgba(139, 69, 19, 0.25);
}

.initiative-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2b2b2b;
  margin-bottom: 8px;
}

.initiative-desc {
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #6b5a48;
  line-height: 1.65;
  margin-bottom: 18px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #8b4513;
  margin-bottom: 6px;
}

/* ===== VISIT ===== */
.visit-section {
  background: linear-gradient(135deg, #2b2b2b, #1a1a1a);
  position: relative;
  overflow: hidden;
}

.visit-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(240, 130, 40, 0.12), transparent 60%);
}

.visit-section .container {
  position: relative;
}

.section-label.light {
  color: #f08228;
}

.section-title.light {
  color: #f5efe6;
}

.section-title.light .highlight {
  color: #f08228;
}

.section-text.light {
  color: rgba(245, 239, 230, 0.75);
}

.visit-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.visit-primary-btn {
  background: linear-gradient(135deg, #f08228, #d4691a) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0 30px !important;
  height: 50px !important;
  box-shadow: 0 6px 24px rgba(240, 130, 40, 0.35) !important;
}

.visit-primary-btn:hover {
  transform: translateY(-2px);
}

.visit-secondary-btn {
  color: #f5efe6 !important;
  border-color: rgba(245, 239, 230, 0.35) !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 0 26px !important;
  height: 50px !important;
}

.visit-secondary-btn:hover {
  background: rgba(245, 239, 230, 0.08) !important;
  border-color: #f5efe6 !important;
}

.visit-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  position: relative;
}

.visit-info-card {
  background: rgba(245, 239, 230, 0.06);
  border: 1px solid rgba(240, 130, 40, 0.2);
  border-radius: 14px;
  padding: 20px 18px;
  transition: all 0.3s ease;
}

.visit-info-card:hover {
  background: rgba(245, 239, 230, 0.1);
  border-color: rgba(240, 130, 40, 0.4);
  transform: translateY(-4px);
}

.visit-info-card h4 {
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f5efe6;
  margin: 10px 0 6px;
}

.visit-info-card p {
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: rgba(245, 239, 230, 0.65);
  line-height: 1.55;
}

/* ===== FOOTER ===== */
.museum-footer {
  background: #1a1a1a;
  padding: 64px 0 32px;
  border-top: 3px solid #8b4513;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-badge {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b4513, #f08228);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f5efe6;
  line-height: 1.1;
}

.footer-sub {
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #f08228;
}

.footer-desc {
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: rgba(245, 239, 230, 0.6);
  line-height: 1.7;
  margin-bottom: 20px;
  max-width: 320px;
}

.footer-social {
  display: flex;
  gap: 8px;
}

.social-btn {
  background: rgba(245, 239, 230, 0.06) !important;
  color: rgba(245, 239, 230, 0.7) !important;
  transition: all 0.25s ease !important;
}

.social-btn:hover {
  background: #8b4513 !important;
  color: white !important;
}

.footer-heading {
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #f5efe6;
  margin-bottom: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-link {
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: rgba(245, 239, 230, 0.6);
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer-link:hover {
  color: #f08228;
}

.footer-divider {
  border-color: rgba(245, 239, 230, 0.1) !important;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: rgba(245, 239, 230, 0.45);
}

.footer-consent {
  color: rgba(240, 130, 40, 0.7);
  font-size: 0.72rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 960px) {
  .desktop-nav {
    display: none !important;
  }
}

@media (max-width: 600px) {
  .app-main {
    padding-top: 64px;
  }
  .app-bar {
    height: 64px !important;
    padding: 0 12px !important;
  }
  .hero-stats {
    gap: 24px;
  }
  .stat-value {
    font-size: 1.8rem;
  }
  .heritage-grid {
    grid-template-columns: 1fr;
  }
  .heritage-card:nth-child(even) {
    transform: none;
  }
  .visit-info-grid {
    grid-template-columns: 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}

html {
  scroll-padding-top: 80px;
}
</style>