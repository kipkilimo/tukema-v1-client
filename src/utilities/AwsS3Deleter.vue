<template>
  <div>
    <h1>Manage Resources</h1>
    <div v-for="resource in resources" :key="resource.coverImage">
      <h2>Resource</h2>
      <p>
        Cover Image:
        <a :href="resource.coverImage" target="_blank">{{
          resource.coverImage
        }}</a>
      </p>
      <p>Content:</p>
      <ul>
        <li v-for="url in parsedContent(resource.content)" :key="url">
          <a :href="url" target="_blank">{{ url }}</a>
        </li>
      </ul>
      <button @click="deleteResource(resource)">Delete Resource</button>
    </div>
    <div v-if="responseMessage" class="response-message">
      {{ responseMessage }}
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// Sample resources array for demonstration
const resources = ref([
  {
    coverImage: "https://example.com/cover1.jpg",
    content:
      '["https://example.com/file1.txt", "https://example.com/file2.txt"]',
  },
  {
    coverImage: "https://example.com/cover2.jpg",
    content:
      '["https://example.com/file3.txt", "https://example.com/file4.txt"]',
  },
]);

// Reactive variables for messages
const responseMessage = ref("");
const errorMessage = ref("");

// Function to parse stringified content
const parsedContent = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing content:", error);
    return [];
  }
};

// Function to handle the deletion of a resource
const deleteResource = async (resource) => {
  try {
    // Extract URLs from the resource object
    const fileUrls = [resource.coverImage, ...parsedContent(resource.content)];

    // Make POST request to backend API
    const response = await axios.post(
      "https://tukema.culture:4000/delete-files",
      {
        fileUrls,
      },
    );

    // Update response message
    responseMessage.value = response.data;
    errorMessage.value = ""; // Clear any previous error message
  } catch (error) {
    console.error("Error sending request:", error);
    responseMessage.value = "";
    errorMessage.value = "An error occurred while deleting files.";
  }
};
</script>

<style scoped>
/* Optional: Add some basic styling */
.response-message {
  color: green;
  margin-top: 10px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
