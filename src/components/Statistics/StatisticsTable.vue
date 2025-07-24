<template>
  <div id="header">
    <h1>{{ unitName }}</h1>
    <select
      v-model="selectedOption"
      class="primary-select"
      @change="fetchServices"
    >
      <option value="ARMED_SERVICES_ARMED_SOLDIERS">
        {{ titles.armedservicesarmedsold }}
      </option>
      <option value="UNARMED_SERVICES_ARMED_SOLDIERS">
        {{ titles.unarmedservicesarmedsold }}
      </option>
      <option value="UNARMED_SERVICES_UNARMED_SOLDIERS">
        {{ titles.unarmedservicesunarmedsold }}
      </option>
      <option value="FREE_OF_DUTY_SERVICES_ALL_SOLDIERS">
        {{ titles.freeofdutyallsold }}
      </option>
    </select>
    <button class="primary-btn" @click="navigateTo('/home')">
      {{ titles.back }}
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
        <tr v-for="soldier in soldiers" :key="soldier.id">
          <td
            v-for="[key, value] in Object.entries(soldier).filter(
              ([key]) => key !== 'id'
            )"
            :key="key"
          >
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useMessageStore } from "@/stores/useMessageStore";

export default {
  setup() {
    const router = useRouter();

    const unitName = ref("");
    const tableHeaders = ref([]);
    const titles = ref({});
    const soldiers = ref({});
    const selectedOption = ref("ARMED_SERVICES_ARMED_SOLDIERS");
    const messageStore = useMessageStore();

    onMounted(async () => {
      getNameOfUnit();
      titles.value = await fetchElementTitles();
      tableHeaders.value = await fetchTableTitles("statistics");
      fetchServices();
    });

    const fetchElementTitles = async () => {
      const lang = localStorage.getItem("lang") || "en";
      const titlesFile = await import(`@/locales/${lang}.json`);
      const titles = titlesFile.default;

      return Object.fromEntries(
        Object.entries(titles)
          .filter(([key]) => key.startsWith("statisticselement."))
          .map(([key, value]) => [
            key.slice("statisticselement.".length),
            value,
          ])
      );
    };

    const getNameOfUnit = async () => {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      try {
        const response = await axios.get("getNameOfUnit");
        unitName.value = response.data;
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          router.push("/signIn");
        } else {
          messageStore.show(
            error.response.data ||
              "You are not authorized to add or delete services.",
            "error"
          );
        }
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
        const fields = ["situation", "active"];

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
              : value; // default to original if no match
        });
      });

      return soldiers;
    };

    const fetchServices = async () => {
      try {
        const selection = localStorage.getItem("personnel");
        const isPersonnel = getCurrentSelection(selection);
        const response = await axios.get("getSoldiersStatistics", {
          params: {
            statisticalDataOption: selectedOption.value,
            isPersonnel: isPersonnel,
          },
        });
        if (response.data.length) soldiers.value = Object.values(response.data);
        setTableDataBasedOnLang(soldiers.value);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) router.push("/signIn");
        messageStore.show(error.response.data, "error");
      }
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    const getCurrentSelection = (selection) => {
      return selection === "soldiers" ? false : true;
    };

    return {
      unitName,
      tableHeaders,
      navigateTo,
      fetchElementTitles,
      titles,
      fetchServices,
      soldiers,
      selectedOption,
      setTableDataBasedOnLang,
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

table {
  width: 100%;
  border-collapse: collapse;
}

.primary-select {
  padding: 10px;
  border: 2px solid #22c55e;
  border-radius: 5px;
  font-size: 1rem;
  color: #1e3a8a;
  background-color: white;
  cursor: pointer;
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

.selected-row {
  background-color: #e0f2fe !important; /* Light blue background when selected */
}

table tr:hover {
  cursor: pointer;
}
</style>
