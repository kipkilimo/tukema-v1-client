// composables/useApi.ts - GraphQL version
import { ref } from "vue";
import { useApolloClient } from "@vue/apollo-composable";
import { useUserStore } from "@/stores/users";

export function useApi() {
  const { client } = useApolloClient();
  const authStore = useUserStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function gqlQuery(query: any, variables?: any, context?: any) {
    loading.value = true;
    error.value = null;

    try {
      const response = await client.query({
        query,
        variables,
        context: {
          ...context,
          headers: {
            ...context?.headers,
            Authorization: `Bearer ${authStore.token}`,
          },
        },
        fetchPolicy: "network-only", // Don't cache for live data
      });

      return response;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function gqlMutate(mutation: any, variables?: any, context?: any) {
    loading.value = true;
    error.value = null;

    try {
      const response = await client.mutate({
        mutation,
        variables,
        context: {
          ...context,
          headers: {
            ...context?.headers,
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      });

      return response;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    gqlQuery,
    gqlMutate,
  };
}
