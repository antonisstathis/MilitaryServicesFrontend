<template>
  <div id="app">
    <div id="header">
      <h1>{{ unitName }}</h1>
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
          <input
            id="registrationInput"
            type="text"
            :placeholder="titles.registrationnumber"
            v-model="soldierIdentity"
            @change="fetchPrevCalculation($event)"
          />
          <button class="primary-btn" @click="addSoldier">
            {{ titles.addsoldier }}
          </button>
          <button class="primary-btn" @click="navigateTo('/home')">
            {{ titles.back }}
          </button>
        </div>
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
          <tr
            v-for="soldier in filteredSoldiers"
            :key="soldier.token"
            @click="selectSoldier(soldier)"
          >
            <td
              v-for="[key, value] in Object.entries(soldier).filter(
                ([key]) => key !== 'token'
              )"
              :key="key"
            >
              {{ value }}
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

    // State variables
    const unitName = ref("");
    const soldiers = ref([]);
    const soldierIdentity = ref("");
    const tableHeaders = ref([]);
    const titles = ref({});
    const locale = ref(localStorage.getItem("lang") || "en");
    const searchQuery = ref("");

    // Lifecycle hooks
    onMounted(async () => {
      getNameOfUnit();
      fetchSoldiers();
      titles.value = await fetchElementTitles();
    });

    // Methods
    const getNameOfUnit = async () => {
      try {
        const response = await axios.get("getNameOfUnit");
        unitName.value = response.data;
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
      }
    };

    const filteredSoldiers = computed(() => {
      console.log("ffffff");
      if (!searchQuery.value) return soldiers.value;

      const query = searchQuery.value.toLowerCase();

      return soldiers.value.filter((soldier) => {
        return Object.values(soldier).some((val) =>
          String(val).toLowerCase().includes(query)
        );
      });
    });

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

    const fetchSoldiers = async () => {
      tableHeaders.value = await fetchTableTitles("soldiers");
      try {
        const response = await axios.get("getSoldiersOfUnit", {});
        const data = await setTableDataBasedOnLang(response.data);
        if (data.length) soldiers.value = Object.values(data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        messageStore.show(error.response.data, "error");
      }
    };

    const addSoldier = () => {
      console.log("addSoldier");
    };

    const changeLanguage = async () => {
      localStorage.setItem("lang", locale.value);
      fetchSoldiers();
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

    const setTableDataBasedOnLang = async (soldiers) => {
      const lang = localStorage.getItem("lang") || "en";
      if (lang === "en") return soldiers;
      const titlesFile = await import(`@/locales/${lang}.json`);

      const keys = [
        "soldierdto.active",
        "soldierdto.freeofduty",
        "soldierdto.armed",
        "soldierdto.unarmed",
        "soldierdto.armedser",
        "soldierdto.unarmedser",
        "soldierdto.onduty",
        "soldierdto.discharged",
      ];

      const translations = keys.reduce((obj, key) => {
        if (key in titlesFile) obj[key.slice(11)] = titlesFile[key];
        return obj;
      }, {});

      soldiers.forEach((soldier) => {
        const fields = ["situation", "active", "armed", "discharged"];

        fields.forEach((field) => {
          const value = soldier[field];

          if (!(field in soldier)) return;

          soldier[field] =
            field === "situation" && value === "armed"
              ? translations["armed"]
              : field === "situation" && value === "unarmed"
              ? translations["unarmed"]
              : field === "active" && value === "active"
              ? translations["active"]
              : field === "active" && value === "free of duty"
              ? translations["freeofduty"]
              : field === "armed" && value === "armed"
              ? translations["armedser"]
              : field === "armed" && value === "unarmed"
              ? translations["unarmedser"]
              : field === "armed" && value === "free of duty"
              ? translations["freeofduty"]
              : field === "discharged" && value === "in operation"
              ? translations["onduty"]
              : field === "discharged" && value === "discharged"
              ? translations["discharged"]
              : value; // default to original if no match
        });
      });

      return soldiers;
    };

    const selectSoldier = async (soldier) => {
      //const lang = localStorage.getItem("lang");
      try {
        console.log(soldier);
        router.push("/servicesOfSoldier");
      } catch (error) {
        console.error("Request failed:", error);
        if (error.response?.status === 401) router.push("/signIn");
      }
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      unitName,
      soldiers,
      tableHeaders,
      titles,
      locale,
      changeLanguage,
      fetchElementTitles,
      getNameOfUnit,
      fetchTableTitles,
      fetchSoldiers,
      selectSoldier,
      navigateTo,
      addSoldier,
      soldierIdentity,
      searchQuery,
      filteredSoldiers,
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
  background: rgba(255, 255, 255, 0.8); /* Slightly Transparent White */
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
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

.registration-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.registration-bar label {
  font-weight: bold;
  font-size: 1rem;
  color: #1e3a8a;
}

.registration-bar input[type="text"] {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  width: 250px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.registration-bar input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  outline: none;
}

.registration-bar .primary-btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 10px;
  white-space: nowrap;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  width: 250px;
}
</style>
