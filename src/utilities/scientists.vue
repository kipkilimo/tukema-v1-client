<template>
  <div class="container">
    <!-- Fixed Select Bar -->
    <v-row class="select-bar" id="selectBar">
      <v-col cols="12" md="3">
        <v-text-field v-model="filters.search" label="Search by Name or Field" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filters.gender" :items="genderOptions" label="Filter by Gender" clearable />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="sortOption" :items="sortOptionText" label="Sort By" />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn class="mt-3 rounded" variant="outlined" @click="resetFilters" color="primary">Reset Filters</v-btn>
      </v-col>
    </v-row>
    <!-- Scrollable Cards Container -->
    <v-card class="scrollable-cards mt-3 ml-1 mt-2" auto-height min-width="74%">
      <!-- Iterate over the filtered and sorted notableFigures array -->
      <v-row>
        <v-col v-for="figure in filteredAndSortedFigures" :key="figure.name" cols="12" md="4">
          <v-card class="ma-4 card-hover" :class="{
            'male-card': figure.gender === 'Male',
            'female-card': figure.gender === 'Female',
          }" @click="handleChipClick(figure), $emit('closeScientists')" height="9.6rem" :style="{
              border: ` ${figure.gender === 'Male' ? '1px' : '1.5px'} solid ${figure.gender === 'Male' ? '#01cdfe' : '#fc3468'}`,
              cursor: 'pointer',
            }">
            <v-card-title>
              <v-icon>{{ figure.mdi_icon }}</v-icon>
              <span class="ml-2">{{ figure.name }} ({{ figure.country_of_origin }})</span>
            </v-card-title>
            <v-card-subtitle>{{ figure.field }}</v-card-subtitle>
            <v-card-text>
              <div>
                <strong>Contributions:</strong> {{ figure.contributions }}
              </div>
              <div><strong>Years:</strong> {{ figure.years }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script setup>
import { ref, onBeforeMount, computed, watch } from "vue";
// Import the array of notableFigures
import notableFigures from "@/data/scientists";
import { useUserStore } from "@/stores/users";
import { emit } from "process";

const authStore = useUserStore();
function handleChipClick(scientist) {
  authStore.username = scientist.name;
}
// Filters and sort options
const filters = ref({
  search: "",
  gender: null,
});

const sortOption = ref(null);
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Shuffle the notableFigures array
onBeforeMount(() => {
  shuffleArray(notableFigures);
});
const sortOptions = [
  { text: "Name (A-Z)", value: "name-asc" },
  { text: "Name (Z-A)", value: "name-desc" },
  { text: "Field (A-Z)", value: "field-asc" },
  { text: "Field (Z-A)", value: "field-desc" },
  { text: "Years (Oldest to Newest)", value: "years-asc" },
  { text: "Years (Newest to Oldest)", value: "years-desc" },
];
const sortOptionText = sortOptions.map((option) => option.text);
const genderOptions = ["Male", "Female"];

// Computed property for filtered and sorted figures
const filteredAndSortedFigures = computed(() => {
  let result = notableFigures;

  // Apply search filter
  if (filters.value.search) {
    const searchQuery = filters.value.search.toLowerCase();
    result = result.filter(
      (figure) =>
        figure.name.toLowerCase().includes(searchQuery) ||
        figure.field.toLowerCase().includes(searchQuery)
    );
  }

  // Apply gender filter
  if (filters.value.gender) {
    result = result.filter((figure) => figure.gender === filters.value.gender);
  }

  // Apply sorting
  if (sortOption.value) {
    const obj = sortOptions.filter((val) => val.text == sortOption.value);
    const [property, order] = obj[0].value.split("-");
    result = result.slice().sort((a, b) => {
      let comparison = 0;

      if (property === "name" || property === "field") {
        comparison = a[property].localeCompare(b[property]);
      } else if (property === "years") {
        // Extract starting year from the "years" field
        const aYear = parseInt(a.years.split("-")[0]);
        const bYear = parseInt(b.years.split("-")[0]);
        comparison = aYear - bYear;
      }

      return order === "asc" ? comparison : -comparison;
    });
  }

  return result;
});

// Watch for changes in filters or sortOption
watch(
  [filters, sortOption],
  () => {
    // Trigger recomputation of filteredAndSortedFigures
  },
  { deep: true }
);

// Reset filters function
const resetFilters = () => {
  filters.value.search = "";
  filters.value.gender = null;
  sortOption.value = null;
};
</script>

<style scoped>
.card-hover {
  transition: background-color 0.3s ease;
}

.male-card:hover {
  background-color: rgba(1, 205, 254, 0.1);
  /* Light blue for 'Male' */
}

.female-card:hover {
  background-color: rgba(252, 52, 104, 0.1);
  /* Light pink for 'Female' */
}

.container {
  position: relative;

  overflow-y: auto;

  overflow-x: hidden;
}

.select-bar {
  position: -webkit-sticky;
  /* For Safari */
  position: sticky;
  top: 0;
  margin-left: 3px;
  background-color: white;
  /* Or use a different background color */
  z-index: 10;
  max-width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  /* Optional shadow for better visibility */
}

.scrollable-cards {
  overflow-y: auto;
  max-height: calc(100vh - 72px);
  /* Adjust this based on the height of your select bar */
}
</style>
