<template>
  <div id="app">
    <nav class="menu">
      <ul>
        <li>
          <router-link to="/home">{{ titles.home }}</router-link>
        </li>
        <li>
          <router-link to="/personnel">{{ titles.personnel }}</router-link>
        </li>
        <li>
          <router-link to="/soldiers">{{ titles.soldiers }}</router-link>
        </li>
        <li>
          <router-link to="/servicesOfUnit">{{ titles.services }}</router-link>
        </li>
      </ul>
    </nav>
    <div id="header">
      <h1>{{ unitName }}</h1>
      <div class="lang-wrapper">
        <select v-model="locale" @change="changeLanguage" class="lang-select">
          <option value="en">🇬🇧 English</option>
          <option value="el">🇬🇷 Ελληνικά</option>
        </select>
      </div>
      <button class="primary-btn" @click="newServices">
        {{ titles.newservices }}
      </button>
      <button class="primary-btn" @click="navigateTo('/servicesOfUnit')">
        {{ titles.servicesofunit }}
      </button>
      <button class="primary-btn" @click="fetchSoldiers">
        {{ titles.lastservices }}
      </button>
      <input type="date" id="date" @change="fetchPrevCalculation($event)" />
      <button class="logout-btn" @click="logout">
        {{ titles.logout }}
      </button>
    </div>
    <div id="table">
      <table>
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
            v-for="soldier in soldiers"
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
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
//import { useI18n } from "vue-i18n";
//const { locale } = useI18n();

export default {
  setup() {
    const router = useRouter();

    // State variables
    const unitName = ref("");
    const soldiers = ref([]);
    const tableHeaders = ref([]);
    const titles = ref({});
    const locale = ref(localStorage.getItem("lang") || "en");

    // Lifecycle hooks
    onMounted(async () => {
      getNameOfUnit();
      fetchSoldiers();
      titles.value = await fetchElementTitles();
    });

    // Methods
    const changeLanguage = async () => {
      localStorage.setItem("lang", locale.value);
      fetchSoldiers();
      titles.value = await fetchElementTitles();
    };

    const fetchElementTitles = async () => {
      const lang = localStorage.getItem("lang") || "en";
      const titlesFile = await import(`@/locales/${lang}.json`);
      const titles = titlesFile.default;

      return Object.fromEntries(
        Object.entries(titles)
          .filter(([key]) => key.startsWith("element."))
          .map(([key, value]) => [key.slice("element.".length), value])
      );
    };

    const getNameOfUnit = async () => {
      try {
        const response = await axios.get("getNameOfUnit");
        unitName.value = response.data;
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
      }
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

    const fetchSoldiers = async () => {
      tableHeaders.value = await fetchTableTitles("lastcalc");
      try {
        const response = await axios.get("getSoldiers", {});
        const data = await setTableDataBasedOnLang(response.data);
        if (data.length) soldiers.value = Object.values(data);

        const dateValue = soldiers.value[0]?.date;
        if (dateValue) {
          const formattedDate = dateValue.split("-").reverse().join("-");
          const date = new Date(formattedDate);
          document.getElementById("date").value = date
            .toISOString()
            .split("T")[0];
        }
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        alert(error);
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
      ];

      const translations = keys.reduce((obj, key) => {
        if (key in titlesFile) obj[key.slice(11)] = titlesFile[key];
        return obj;
      }, {});

      /*
      for (let i = 0; i < soldiers.length; i++) {
        const soldier = soldiers[i];
        const fields = ["situation", "active", "armed"];

        for (let j = 0; j < fields.length; j++) {
          const field = fields[j];
          const value = soldier[field];
          console.log(`Soldier[${i}] field: ${field}, value: "${value}"`);

          if (field === "situation" && value === "armed") {
            soldier[field] = translations["active"];
          } else if (field === "situation" && value === "unarmed") {
            soldier[field] = translations["freeofduty"];
          } else if (field === "active" && value === "active") {
            soldier[field] = translations["armed"];
          } else if (field === "active" && value === "free of duty") {
            soldier[field] = translations["unarmed"];
          } else if (field === "armed" && value === "armed") {
            soldier[field] = translations["armedser"];
          } else if (field === "armed" && value === "unarmed") {
            soldier[field] = translations["unarmedser"];
          }
        }
      }
      */

      soldiers.forEach((soldier, i) => {
        const fields = ["situation", "active", "armed"];

        fields.forEach((field) => {
          const value = soldier[field];
          console.log(`Soldier[${i}] field: ${field}, value: "${value}"`);

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
              : value; // default to original if no match
        });
      });

      return soldiers;
    };

    const fetchPrevCalculation = async (event) => {
      tableHeaders.value = await fetchTableTitles("prevcalc");
      const selectedDate = event.target.value;
      try {
        const response = await axios.get("getPreviousCalculation", {
          params: { date: selectedDate },
        });
        const data = response.data;
        if (data.length) soldiers.value = Object.values(data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        alert(error);
      }
    };

    const newServices = async () => {
      try {
        await axios.get("calc");
        fetchSoldiers();
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        alert(error);
      }
    };

    const selectSoldier = async (soldier) => {
      const lang = localStorage.getItem("lang");
      try {
        const response = await axios.post("getSoldier", soldier, {
          params: { lang },
        });
        localStorage.setItem("formData", JSON.stringify(response.data));
        router.push("/soldierForm");
      } catch (error) {
        console.error("Request failed:", error);
        if (error.response?.status === 401) router.push("/signIn");
      }
    };

    const logout = () => {
      localStorage.clear();
      router.push("/signIn");
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
      fetchPrevCalculation,
      newServices,
      selectSoldier,
      logout,
      navigateTo,
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
  background-color: #22c55e; /* Soft Green */
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

.logout-btn {
  background-color: white;
  color: #ef4444; /* Red for contrast */
  border: 2px solid #ef4444;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}

.menu {
  width: 100%;
  background: #1e3a8a; /* Deep Navy Blue */
  padding: 15px 0;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.menu li {
  display: inline;
}

.menu a {
  text-decoration: none;
  color: white;
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s ease-in-out, color 0.3s linear,
    transform 0.3s ease, opacity 0.3s ease-out;
  font-size: 1.2rem;
}

.menu a:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #22c55e; /* Soft Green */
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
</style>
