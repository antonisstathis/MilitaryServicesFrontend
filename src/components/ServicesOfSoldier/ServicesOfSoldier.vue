<template>
  <div id="app">
    <div id="header">
      <h1>{{ soldierName }}</h1>
      <div class="lang-wrapper">
        <select v-model="locale" @change="changeLanguage" class="lang-select">
          <option value="en">🇬🇧 English</option>
          <option value="el">🇬🇷 Ελληνικά</option>
        </select>
      </div>
    </div>
    <div id="table">
      <div class="registration-input">
        <div class="registration-bar">
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="titles.search"
            class="search-input"
          />
          <select v-model="armedFilter" class="armed-select">
            <option value="armed">Armed</option>
            <option value="unarmed">Unarmed</option>
            <option value="free of duty">Free of Duty</option>
            <option value="all">All</option>
          </select>
          <button class="primary-btn" @click="dischargeSoldier()">
            {{ titles.dischargesoldier }}
          </button>
          <button class="primary-btn" @click="navigateTo('/soldiersList')">
            {{ titles.back }}
          </button>
        </div>
      </div>
      <div class="table-meta">
        {{ filteredServices.length }} {{ titles.services }}
      </div>
      <table class="table-scroll-wrapper">
        <thead>
          <tr>
            <th
              v-for="(title, index) in tableHeaders"
              :key="index"
              :title="title"
            >
              {{ title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td
              v-for="[key, value] in Object.entries(service).filter(
                ([key]) => key !== 'id'
              )"
              :key="key"
            >
              {{ key === "serviceDate" ? formatDate(value) : value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useMessageStore } from "@/stores/useMessageStore";

export default {
  setup() {
    const router = useRouter();
    const messageStore = useMessageStore();
    const armedFilter = ref("all");

    // State variables
    const soldierName = ref("");
    const searchQuery = ref("");
    const titles = ref({});
    const services = ref([]);
    const tableHeaders = ref([]);
    const locale = ref(localStorage.getItem("lang") || "en");

    // Lifecycle hooks
    onMounted(async () => {
      getNameOfSoldier();
      fetchServicesOfSoldier();
      titles.value = await fetchElementTitles();
    });

    //Methods
    const getNameOfSoldier = async () => {
      try {
        soldierName.value = localStorage.getItem("soldierName");
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServicesOfSoldier = async () => {
      tableHeaders.value = await fetchTableTitles("servicesofsold");
      const soldierToken = localStorage.getItem("soldierToken");
      try {
        const response = await axios.get("getServicesOfSoldier", {
          params: { soldierToken: soldierToken },
        });
        services.value = response.data;
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        messageStore.show(error.response.data, "error");
      }
    };

    const dischargeSoldier = async () => {
      const soldierToken = localStorage.getItem("soldierToken");
      try {
        const response = await axios.get("dischargeSoldier", {
          params: { soldierToken: soldierToken },
        });
        messageStore.show(response.data, "success");
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        messageStore.show(error.response.data, "error");
      }
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

    const changeLanguage = async () => {
      localStorage.setItem("lang", locale.value);
      fetchServicesOfSoldier();
      titles.value = await fetchElementTitles();
    };

    const fetchTableTitles = async (prefix) => {
      const lang = localStorage.getItem("lang") || "en";

      try {
        const titlesFile = await import(`@/locales/${lang}.json`);
        const allTitles = titlesFile.default;

        return Object.fromEntries(
          Object.entries(allTitles).filter(([key]) =>
            key.startsWith(prefix + ".")
          )
        );
      } catch (error) {
        console.error(`Could not load titles for language '${lang}':`, error);
        return {};
      }
    };

    const filteredServices = computed(() => {
      let results = services.value;

      if (armedFilter.value !== "all") {
        results = results.filter(
          (service) => service.armed === armedFilter.value
        );
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        results = results.filter((service) =>
          Object.values(service).some((val) =>
            String(val).toLowerCase().includes(query)
          )
        );
      }

      return results;
    });

    const formatDate = (value) => {
      if (typeof value === "string" && value.includes("T")) {
        return value.split("T")[0];
      }
      return value;
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      soldierName,
      tableHeaders,
      titles,
      locale,
      changeLanguage,
      fetchServicesOfSoldier,
      fetchElementTitles,
      getNameOfSoldier,
      searchQuery,
      filteredServices,
      armedFilter,
      fetchTableTitles,
      navigateTo,
      formatDate,
      dischargeSoldier,
    };
  },
};
</script>

<style scoped>
#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: "Arial", sans-serif;
  background: linear-gradient(
    135deg,
    #e0f2fe,
    #f0fdf4
  ); /* Soft Blue to Soft Green */
}

#header {
  font-size: 3rem;
  color: #1e3a8a; /* Deep Navy Blue */
  text-align: center;
  margin-top: 50px;
}

.primary-btn {
  background-color: #22c55e;
  color: white;
  border: 2px solid #22c55e;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background-color: white;
  color: #22c55e;
}

#table {
  width: 70%;
  margin: 20px auto;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.8); /* Slightly Transparent White */
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Ensures border-radius works */
}

th,
td {
  padding: 12px;
  border: 1px solid #ddd;
}

th {
  background-color: #1e3a8a; /* Deep Blue */
  color: white;
}

tr:nth-child(even) {
  background-color: #f3f4f6; /* Light Gray */
}

tr:hover {
  background-color: #e5e7eb; /* Slightly Darker Gray */
}

input[type="date"] {
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="date"]:focus {
  border-color: #3b82f6; /* blue-500 */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  outline: none;
}

.lang-wrapper {
  position: absolute;
  top: 110px;
  right: 20px;
  z-index: 1000;
}

.lang-select {
  appearance: none;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  font-size: 14px;
  font-family: inherit;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-select:hover {
  background-color: #e2e2e2;
}

.lang-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  width: 250px;
}

.table-meta {
  width: 100%;
  text-align: left;
  font-size: 1rem;
  color: #1e3a8a;
  margin-bottom: 8px;
  font-weight: 500;
  padding-right: 10px;
}

.armed-select {
  appearance: none;
  padding: 8px 12px;
  margin: 0 10px;
  border-radius: 12px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.armed-select:hover {
  background-color: #e2e2e2;
}

.armed-select:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.25);
}
</style>
