<template>
  <div class="form-container">
    <div class="form-header">
      <h2>{{ titles.addnewsoldier }}</h2>
      <button @click="goBack" class="back-button">← {{ titles.back }}</button>
    </div>

    <form @submit.prevent="submitForm" class="form-grid">
      <div
        v-for="(label, key) in filteredTableHeaders"
        :key="key"
        class="form-field"
      >
        <label :for="key">{{ label }}</label>

        <select
          v-if="key === 'situation' || key === 'active' || key === 'group'"
          :id="key"
          v-model="form[key]"
          required
        >
          <option disabled value="">-- Select --</option>
          <option
            v-for="option in getSelectOptions(key)"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <input v-else type="text" :id="key" v-model="form[key]" required />
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-button">
          {{ titles.addsoldier }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useMessageStore } from "@/stores/useMessageStore";

export default {
  setup() {
    const router = useRouter();
    const messageStore = useMessageStore();
    const titles = ref({});
    const tableHeaders = ref([]);

    onMounted(async () => {
      titles.value = await fetchElementTitles();
      tableHeaders.value = await fetchTableTitles("soldiers");
    });

    const form = reactive(
      Object.fromEntries(
        Object.keys(tableHeaders.value).map((key) => [key, ""])
      )
    );

    const filteredTableHeaders = computed(() => {
      return Object.fromEntries(
        Object.entries(tableHeaders.value).filter(
          ([key]) => key !== "discharged"
        )
      );
    });

    const submitForm = async () => {
      try {
        const response = await axios.post("/saveNewSoldier", form);
        messageStore.show(response.data, "success");
      } catch (error) {
        messageStore.show(error.response.data, "error");
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
      }
    };

    const goBack = () => {
      router.back();
    };

    const fetchElementTitles = async () => {
      const lang = localStorage.getItem("lang") || "en";
      const titlesFile = await import(`@/locales/${lang}.json`);
      const titles = titlesFile.default;

      return Object.fromEntries(
        Object.entries(titles)
          .filter(([key]) => key.startsWith("soldierselement."))
          .map(([key, value]) => [key.slice("soldierselement.".length), value])
      );
    };

    const fetchTableTitles = async (prefix) => {
      const lang = localStorage.getItem("lang") || "en";

      try {
        const titlesFile = await import(`@/locales/${lang}.json`);
        const allTitles = titlesFile.default;

        return Object.fromEntries(
          Object.entries(allTitles)
            .filter(([key]) => key.startsWith(prefix + "."))
            .map(([key, value]) => [key.slice(prefix.length + 1), value])
        );
      } catch (error) {
        console.error(`Could not load titles for language '${lang}':`, error);
        return {};
      }
    };

    const getSelectOptions = (key) => {
      const optionsMap = {
        active: ["active", "inactive"],
        situation: ["armed", "unarmed"],
        group: ["A", "B", "C", "D", "E"],
      };
      return optionsMap[key] || [];
    };

    return {
      titles,
      form,
      fetchElementTitles,
      submitForm,
      goBack,
      tableHeaders,
      getSelectOptions,
      filteredTableHeaders,
    };
  },
};
</script>

<style scoped>
.form-container {
  max-width: 48rem;
  margin: 2.5rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1f2937;
}

.back-button {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.back-button:hover {
  color: #1d4ed8;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-field input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #1d4ed8;
}
</style>
