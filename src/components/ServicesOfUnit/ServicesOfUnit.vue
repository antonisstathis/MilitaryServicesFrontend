<template>
  <div id="header">
    <h1>{{ unitName }}</h1>
    <button class="primary-btn" @click="showPopup = true">Add Services</button>
    <button class="primary-btn" @click="deleteServices">Delete Services</button>
    <button class="primary-btn" @click="navigateTo('/home')">Back</button>
  </div>
  <div id="table">
    <table>
      <thead>
        <tr>
          <th v-for="key in tableHeaders.slice(1)" :key="key">
            {{ key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="service in services"
          :key="service.id"
          @click="selectSoldier(service)"
        >
          <td v-for="key in tableHeaders.slice(1)" :key="key">
            {{ service[key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="showPopup" class="popup-overlay">
    <div class="popup-content">
      <h3>Select Services</h3>

      <label>
        Service Category:
        <select v-model="selectedService">
          <option disabled value="">Please select</option>
          <option>Gate Guards</option>
          <option>Gate Shell Assistant</option>
          <option>Patrol Guards</option>
          <option>Cameras</option>
          <option>Cabin Guard</option>
        </select>
      </label>

      <label>
        Number Of Guards:
        <select v-model="selectedNumberOfGuards">
          <option disabled value="">Please select</option>
          <option>1</option>
          <option>2</option>
        </select>
      </label>

      <label>
        Select Shifts:
        <select v-model="selectedNumberOfShifts">
          <option disabled value="">Please select</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
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
    const selectedService = ref("");
    const selectedNumberOfGuards = ref("");
    const selectedNumberOfShifts = ref("");

    const saveServices = () => {
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

    const fetchServicesOfUnit = async () => {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      try {
        const response = await axios.get("getServices");
        const data = response.data;
        if (data.length) {
          tableHeaders.value = Object.keys(data[0]);
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

    onMounted(() => {
      getNameOfUnit();
      fetchServicesOfUnit();
    });

    return {
      unitName,
      tableHeaders,
      services,
      navigateTo,
      showPopup,
      selectedService,
      selectedNumberOfGuards,
      selectedNumberOfShifts,
      saveServices,
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
</style>
