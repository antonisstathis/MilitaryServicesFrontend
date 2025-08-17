<template>
  <div id="header">
    <h1>{{ unitName }}</h1>
    <button class="primary-btn" @click="showPopup = true">
      {{ titles.addservices }}
    </button>
    <button class="primary-btn" @click="deleteSelectedServices">
      {{ titles.deleteservices }}
    </button>
    <button
      class="primary-btn"
      @click="fetchServicesOfUnit(null, getCurrentSelection())"
    >
      {{ titles.currentservices }}
    </button>
    <button class="primary-btn" @click="navigateTo('/home')">
      {{ titles.back }}
    </button>
    <div class="date-toggle-wrapper">
      <input
        type="date"
        id="date"
        v-model="selectedDate"
        @change="fetchServicesOfUnit($event, getCurrentSelection())"
      />
      <div class="dual-toggle">
        <div
          :class="['toggle-option', activeList === 'personnel' ? 'active' : '']"
          @click="switchList('personnel')"
          title="Load Personnel"
        >
          👥
        </div>
        <div
          :class="['toggle-option', activeList === 'soldiers' ? 'active' : '']"
          @click="switchList('soldiers')"
          title="Load Soldiers"
        >
          🪖
        </div>
      </div>
    </div>
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
          v-for="service in services"
          :key="service.id"
          @click="toggleSelection(service)"
          :class="{ 'selected-row': selectedServices.includes(service) }"
        >
          <td
            v-for="[key, value] in Object.entries(service).filter(
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

  <div v-if="showPopup" class="popup-overlay">
    <div class="popup-content">
      <h3>Select Services</h3>

      <label>
        Name Of Service:
        <input
          type="text"
          v-model="nameOfService"
          placeholder="Enter name of service"
        />
      </label>

      <label>
        Armed:
        <select v-model="armed">
          <option disabled value="">Please select</option>
          <option>armed</option>
          <option>unarmed</option>
        </select>
      </label>

      <label>
        Description:
        <input
          type="text"
          v-model="description"
          placeholder="Enter description"
        />
      </label>

      <label>
        Shift:
        <input type="text" v-model="shift" placeholder="Enter shift" />
      </label>

      <label>
        Number Of Guards:
        <select v-model="selectedNumberOfGuards">
          <option disabled value="">Please select</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
      </label>

      <label>
        Group:
        <select v-model="group">
          <option disabled value="">Please select</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
          <option>E</option>
        </select>
      </label>

      <div class="popup-buttons">
        <button class="primary-btn" @click="saveServices">Save</button>
        <button class="primary-btn" @click="showPopup = false">Cancel</button>
      </div>
    </div>
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
    const services = ref([]);
    const showPopup = ref(false);
    const nameOfService = ref("");
    const armed = ref("");
    const description = ref("");
    const shift = ref("");
    const selectedNumberOfGuards = ref("");
    const group = ref("");
    const selectedServices = ref([]);
    const titles = ref({});
    const selectedDate = ref("");
    const messageStore = useMessageStore();
    const activeList = ref("soldiers");

    onMounted(async () => {
      getNameOfUnit();
      fetchServicesOfUnit(null, getCurrentSelection());
      titles.value = await fetchElementTitles();
    });

    const fetchElementTitles = async () => {
      const lang = localStorage.getItem("lang") || "en";
      const titlesFile = await import(`@/locales/${lang}.json`);
      const titles = titlesFile.default;

      return Object.fromEntries(
        Object.entries(titles)
          .filter(([key]) => key.startsWith("serofunitelement."))
          .map(([key, value]) => [key.slice("serofunitelement.".length), value])
      );
    };

    const toggleSelection = (service) => {
      const index = selectedServices.value.indexOf(service);
      if (index === -1) {
        selectedServices.value.push(service);
      } else {
        selectedServices.value.splice(index, 1);
      }
    };

    const deleteSelectedServices = async () => {
      try {
        if (selectedServices.value.length === 0) {
          messageStore.show("No services selected.", "error");
          return;
        }

        const idsToDelete = selectedServices.value.map((service) => service.id);
        const response = await axios.post("deleteServices", {
          ids: idsToDelete,
        });

        services.value = services.value.filter(
          (service) => !idsToDelete.includes(service.id)
        );
        selectedServices.value = [];
        messageStore.show(response.data, "success");
      } catch (error) {
        handleError(error);
      }
    };

    const saveServices = async () => {
      try {
        const payload = {
          service: nameOfService.value,
          armed: armed.value,
          description: description.value,
          shift: shift.value,
          numberOfGuards: selectedNumberOfGuards.value,
          group: group.value,
        };

        const isPersonnel = getCurrentSelection();
        const response = await axios.post("saveNewServices", payload, {
          params: {
            isPersonnel: isPersonnel,
          },
        });
        showPopup.value = false;
        fetchServicesOfUnit(null, getCurrentSelection());
        messageStore.show(response.data, "success");
      } catch (error) {
        handleError(error);
      }
      showPopup.value = false;
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
        handleError(error);
      }
    };

    const getDateOfLastCalculation = async () => {
      const jwtToken = localStorage.getItem("jwtToken");
      const isPersonnel = getCurrentSelection();
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      try {
        const response = await axios.get("getLastCalcDate", {
          params: { isPersonnel: isPersonnel },
        });
        const dateOflastCalc = response.data;
        return dateOflastCalc;
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

    const fetchServicesOfUnit = async (event = null, isPersonnel) => {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      tableHeaders.value = await fetchTableTitles("serofunit");
      const isChangeDateEvent = event && event.type === "change";
      let dateOfServices;
      if (!isChangeDateEvent) {
        const rawDate = await getDateOfLastCalculation();
        dateOfServices = new Date(rawDate).toLocaleDateString("en-CA");
      }
      if (isChangeDateEvent) {
        dateOfServices = new Date(event.target.value).toLocaleDateString(
          "en-CA"
        );
      }
      selectedDate.value = dateOfServices;

      try {
        const response = await axios.get("getServices", {
          params: { date: dateOfServices, isPersonnel: isPersonnel },
        });
        const data = response.data;
        if (data.length) {
          services.value = data;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const handleError = (error) => {
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
    };

    const switchList = (listType) => {
      activeList.value = listType;
      if (listType === "soldiers") fetchServicesOfUnit(null, false);
      else fetchServicesOfUnit(null, true);
    };

    const getCurrentSelection = () => {
      return activeList.value === "soldiers" ? false : true;
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      unitName,
      tableHeaders,
      services,
      navigateTo,
      showPopup,
      saveServices,
      nameOfService,
      armed,
      description,
      shift,
      selectedNumberOfGuards,
      group,
      selectedServices,
      toggleSelection,
      deleteSelectedServices,
      fetchElementTitles,
      fetchServicesOfUnit,
      titles,
      selectedDate,
      getDateOfLastCalculation,
      handleError,
      activeList,
      switchList,
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

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-content {
  background-color: #fff;
  padding: 20px;
  width: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.popup-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.popup-content label {
  display: block;
  margin: 10px 0;
}

.popup-content select {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
}

.popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.popup-content input,
.popup-content select {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9fafb;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.popup-content input:focus,
.popup-content select:focus {
  border-color: #22c55e; /* match your primary color */
  outline: none;
}

/* Wrapper for date and toggle */
.date-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Dual toggle switch */
.dual-toggle {
  display: flex;
  border: 2px solid #1e3a8a;
  border-radius: 999px;
  overflow: hidden;
  height: 42px;
  background: #f9fafb;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  min-width: 120px;
}

.toggle-option {
  flex: 1;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1e3a8a;
  font-size: 1rem;
  transition: background-color 0.3s, color 0.3s;
  position: relative;
  white-space: nowrap;
}

.toggle-option:hover {
  background-color: #e0f2fe;
}

.toggle-option.active {
  background-color: #22c55e;
  color: white;
}
</style>
