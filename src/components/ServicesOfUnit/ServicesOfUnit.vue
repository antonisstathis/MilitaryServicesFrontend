<template>
  <div id="header">
    <h1>{{ unitName }}</h1>
    <button class="primary-btn" @click="showPopup = true">
      {{ titles.addservices }}
    </button>
    <button class="primary-btn" @click="deleteSelectedServices">
      {{ titles.deleteservices }}
    </button>
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
    const selectedServices = ref([]);
    const titles = ref({});

    onMounted(async () => {
      getNameOfUnit();
      fetchServicesOfUnit();
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
          alert("No services selected!");
          return;
        }

        const idsToDelete = selectedServices.value.map((service) => service.id);
        await axios.post("deleteServices", { ids: idsToDelete });

        services.value = services.value.filter(
          (service) => !idsToDelete.includes(service.id)
        );
        selectedServices.value = [];
      } catch (error) {
        console.error("Failed to delete services:", error);
        alert("An error occurred while deleting services.");
      }
    };

    const saveServices = async () => {
      try {
        const payload = {
          nameOfService: nameOfService.value,
          armed: armed.value,
          description: description.value,
          shift: shift.value,
          selectedNumberOfGuards: selectedNumberOfGuards.value,
        };

        await axios.post("saveNewServices", payload);
        showPopup.value = false;
        fetchServicesOfUnit();
      } catch (error) {
        if (error.response) {
          console.log(error);
          console.log(error.response);
          alert(
            error.response.data ||
              "You are not authorized to add or delete services."
          );
        }
        console.error("Request failed:", error);
        if (error.response?.status === 401) router.push("/signIn");
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
        console.error(error);
        if (error.response?.status === 401) {
          router.push("/signIn");
        } else {
          alert(error);
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

    const fetchServicesOfUnit = async () => {
      tableHeaders.value = await fetchTableTitles("serofunit");
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      try {
        const response = await axios.get("getServices");
        const data = response.data;
        if (data.length) {
          services.value = data;
        }
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          router.push("/signIn");
        } else {
          alert(error);
        }
      }
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
      selectedServices,
      toggleSelection,
      deleteSelectedServices,
      fetchElementTitles,
      titles,
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
</style>
