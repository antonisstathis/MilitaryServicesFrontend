<template>
  <div id="app">
    <nav class="menu">
      <ul>
        <li>
          <router-link to="/home">{{ titles.home }}</router-link>
        </li>
        <li
          @mouseenter="showSubmenu = true"
          @mouseleave="showSubmenu = false"
          style="position: relative"
        >
          <router-link to="/soldiersList">{{ titles.personnel }}</router-link>
          <ul v-show="showSubmenu" class="submenu">
            <li @click="goToPersonnelList()">
              {{ titles.personnelList }}
            </li>
            <li @click="goToPersonnelStats()">
              {{ titles.statistics }}
            </li>
          </ul>
        </li>
        <li
          @mouseenter="showSubmenu = true"
          @mouseleave="showSubmenu = false"
          style="position: relative"
        >
          <router-link to="/soldiersList">{{ titles.soldiers }}</router-link>
          <ul v-show="showSubmenu" class="submenu">
            <li @click="goToSoldiersList()">
              {{ titles.soldiersList }}
            </li>
            <li @click="goToSoldiersStats()">
              {{ titles.statistics }}
            </li>
          </ul>
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
      <button class="primary-btn" @click="fetchSoldiers(getCurrentSelection())">
        {{ titles.lastservices }}
      </button>
      <button class="logout-btn" @click="logout">
        {{ titles.logout }}
      </button>
    </div>
    <div id="table">
      <div id="telemets">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="titles.search"
          class="search-input"
        />
        <input
          type="date"
          id="date"
          v-model="selectedDate"
          @change="fetchPrevCalculation($event)"
        />

        <div class="dual-toggle">
          <div
            :class="[
              'toggle-option',
              activeList === 'personnel' ? 'active' : '',
            ]"
            @click="switchList('personnel')"
            title="Load Personnel"
          >
            👥
          </div>
          <div
            :class="[
              'toggle-option',
              activeList === 'soldiers' ? 'active' : '',
            ]"
            @click="switchList('soldiers')"
            title="Load Soldiers"
          >
            🪖
          </div>
        </div>
      </div>
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
    const personnel = ref([]);
    const activeList = ref("soldiers");
    const tableHeaders = ref([]);
    const titles = ref({});
    const locale = ref(localStorage.getItem("lang") || "en");
    let firstDate;
    let lastDate;
    const selectedDate = ref("");
    const searchQuery = ref("");
    const showSubmenu = ref(false);
    const toggleState = ref(false);

    // Lifecycle hooks
    onMounted(async () => {
      getNameOfUnit();
      getFirstDateCalc();
      fetchSoldiers(false);
      fetchSoldiers(true);
      const personnelValue = localStorage.getItem("personnel");
      if (personnelValue) switchList(personnelValue);
      else localStorage.setItem("personnel", "soldiers");
      titles.value = await fetchElementTitles();
    });

    // Methods
    const getNameOfUnit = async () => {
      try {
        const response = await axios.get("getNameOfUnit");
        unitName.value = response.data;
      } catch (error) {
        handleError(error);
      }
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

    const getFirstDateCalc = async () => {
      try {
        const response = await axios.get("getFirstCalcDate");
        firstDate = new Date(response.data);
      } catch (error) {
        handleError(error);
      }
    };

    const switchList = (listType) => {
      localStorage.setItem("personnel", listType);
      activeList.value = listType;
      if (listType === "soldiers") fetchSoldiers(false);
      else fetchSoldiers(true);
    };

    const fetchSoldiers = async (isPersonnel) => {
      tableHeaders.value = await fetchTableTitles("lastcalc");
      try {
        const response = await axios.get("getSoldiers", {
          params: { isPersonnel: isPersonnel },
        });
        const data = await setTableDataBasedOnLang(response.data);
        localStorage.setItem("selectedDate", lastDate);
        if (data.length && !isPersonnel) soldiers.value = Object.values(data);
        if (data.length && isPersonnel) personnel.value = Object.values(data);

        const dateValue = isPersonnel
          ? personnel.value[0]?.date
          : soldiers.value[0]?.date;
        if (dateValue) {
          const formattedDate = dateValue.split("-").reverse().join("-");
          const date = new Date(formattedDate);
          lastDate = date;
          selectedDate.value = date.toLocaleDateString("en-CA");
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchPrevCalculation = (event) => {
      selectedDate.value = new Date(event.target.value);
      if (selectedDate.value < firstDate || selectedDate.value > lastDate) {
        const lastSelectedDate = localStorage.getItem("selectedDate");
        const dateToSet =
          typeof lastSelectedDate === "string"
            ? new Date(lastSelectedDate)
            : lastSelectedDate;
        selectedDate.value = dateToSet.toLocaleDateString("en-CA");
        messageStore.show(
          `The date you selected is out of this period (${firstDate},${lastDate}.)`,
          "error",
          3300
        );
        return;
      }
      changeLanguage();
    };

    const changeLanguage = async () => {
      localStorage.setItem("lang", locale.value);

      const isPersonnel = getCurrentSelection();
      const selDate =
        typeof selectedDate.value === "string"
          ? new Date(selectedDate.value)
          : selectedDate.value;
      if (lastDate && selDate && !isSameDay(selDate, lastDate))
        fetchPrevCalculationData(selectedDate.value);
      else fetchSoldiers(isPersonnel);
      titles.value = await fetchElementTitles();
    };

    const fetchPrevCalculationData = async (selDate) => {
      tableHeaders.value = await fetchTableTitles("prevcalc");
      localStorage.setItem("selectedDate", selDate);
      try {
        const isPersonnel = getCurrentSelection();
        selectedDate.value =
          typeof selDate === "string"
            ? selDate
            : selDate.toLocaleDateString("en-CA");
        const response = await axios.get("getPreviousCalculation", {
          params: { date: selDate, isPersonnel: isPersonnel },
        });
        const data = await setTableDataBasedOnLang(response.data);
        if (data.length && isPersonnel) personnel.value = Object.values(data);
        if (data.length && !isPersonnel) soldiers.value = Object.values(data);
      } catch (error) {
        handleError(error);
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

    const isSameDay = (date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    const newServices = async () => {
      try {
        const isPersonnel = getCurrentSelection();
        const response = await axios.get("calc", {
          params: {
            lastDate: lastDate,
            isPersonnel: isPersonnel,
          },
        });
        fetchSoldiers(isPersonnel);
        messageStore.show(response.data, "success", 3000);
      } catch (error) {
        handleError(error);
      }
    };

    const selectSoldier = async (soldier) => {
      const lang = localStorage.getItem("lang");

      const filteredSoldier = Object.fromEntries(
        Object.entries(soldier).filter(
          ([key]) =>
            key !== "date" &&
            key !== "armed" &&
            key !== "service" &&
            key !== "company"
        )
      );
      filteredSoldier["group"] = "A";

      try {
        const response = await axios.post("getSoldier", filteredSoldier, {
          params: { lang },
        });
        localStorage.setItem("formData", JSON.stringify(response.data));
        router.push("/soldierForm");
      } catch (error) {
        handleError(error);
      }
    };

    const logout = () => {
      localStorage.clear();
      router.push("/signIn");
    };

    const handleError = (error) => {
      console.error(error);
      if (error.response?.status === 401) router.push("/signIn");
      messageStore.show(error.response.data, "error");
    };

    const goToPersonnelList = () => {
      localStorage.setItem("personnel", "personnel");
      navigateTo("/soldiersList");
    };

    const goToSoldiersList = () => {
      localStorage.setItem("personnel", "soldiers");
      navigateTo("/soldiersList");
    };

    const goToPersonnelStats = () => {
      localStorage.setItem("personnel", "personnel");
      navigateTo("/soldiersStats");
    };

    const goToSoldiersStats = () => {
      localStorage.setItem("personnel", "soldiers");
      navigateTo("/soldiersStats");
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    const getCurrentSelection = () => {
      return activeList.value === "soldiers" ? false : true;
    };

    const filteredSoldiers = computed(() => {
      const list = getCurrentSelection() ? personnel : soldiers;
      if (!searchQuery.value) return list.value;

      const query = searchQuery.value.toLowerCase();
      if (query === "armed") {
        return list.value.filter(
          (soldier) => soldier.situation?.toLowerCase() === "armed"
        );
      }

      return list.value.filter((soldier) =>
        Object.values(soldier).join(" ").toLowerCase().includes(query)
      );
    });

    return {
      unitName,
      soldiers,
      personnel,
      activeList,
      tableHeaders,
      titles,
      locale,
      changeLanguage,
      fetchElementTitles,
      getNameOfUnit,
      fetchTableTitles,
      fetchSoldiers,
      switchList,
      fetchPrevCalculation,
      newServices,
      selectSoldier,
      logout,
      goToPersonnelList,
      goToSoldiersList,
      goToPersonnelStats,
      goToSoldiersStats,
      navigateTo,
      selectedDate,
      filteredSoldiers,
      searchQuery,
      showSubmenu,
      toggleState,
      handleError,
      getCurrentSelection,
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

#telemets {
  display: flex;
  gap: 10px; /* Space between inputs */
  justify-content: flex-start; /* Align to the left */
  margin-bottom: 20px; /* Space between inputs and table */
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

.search-input,
.date-input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  height: 40px;
  box-sizing: border-box;
  width: 250px;
}

/* Enhanced submenu styles */
.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 10px 0;
  margin-top: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  min-width: 220px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.25s ease-in-out;
}

/* Make it appear when triggered */
li:hover > .submenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Submenu item styles */
.submenu li {
  padding: 8px 16px;
  white-space: nowrap;
  font-size: 1rem;
  color: #1e3a8a;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 600; /* Make text thicker */
  line-height: 1.4; /* Optional: adjust line height for balance */
}

.submenu li::after {
  content: "→";
  position: absolute;
  right: 16px;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
}

.submenu li:hover {
  background-color: #f0fdf4;
  color: #22c55e;
  font-weight: 600;
}

.submenu li:hover::after {
  opacity: 1;
  transform: translateX(0);
}

.dual-toggle {
  display: flex;
  margin-left: 10px;
  border: 2px solid #1e3a8a;
  border-radius: 999px;
  overflow: hidden;
  height: 42px;
  background: #f9fafb;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.toggle-option {
  flex: 1;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1e3a8a;
  font-size: 1.2rem;
  transition: background-color 0.3s, color 0.3s;
  position: relative;
}

.toggle-option:hover {
  background-color: #e0f2fe;
}

.toggle-option.active {
  background-color: #22c55e;
  color: white;
}
</style>
