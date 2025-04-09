<template>
  <div id="header">
    <h1>Services of Unit</h1>
    <button @click="redirectToNewService" class="primary-btn">
      New Service
    </button>
    <button @click="deleteServices" class="primary-btn">Delete Services</button>
    <h2 v-if="services.length === 0" class="hideElement">
      No services. Please click the New Service button to add services.
    </h2>
  </div>
  <div id="table">
    <table v-if="services.length" id="myTable">
      <thead>
        <tr>
          <th v-for="(key, index) in tableHeaders" :key="index">
            {{ capitalizeFirstLetter(key) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(service, index) in services" :key="index">
          <td v-for="(value, key) in service" :key="key">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      services: [],
      pageUrl: `${this.$config.backEndUrl}getServices`,
      newServiceUrl: `${this.$config.backEndUrl}showFormForService`,
    };
  },
  computed: {
    tableHeaders() {
      return this.services.length ? Object.keys(this.services[0]) : [];
    },
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch(this.pageUrl);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          console.log("Received empty or invalid data.");
        } else {
          this.services = data;
        }
      } catch (error) {
        alert(error);
      }
    },
    redirectToNewService() {
      window.location.href = this.newServiceUrl;
    },
    deleteServices() {
      console.log("Delete functionality to be implemented");
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style>
table {
  width: 70%;
  margin: 20px auto;
  border-collapse: collapse;
  text-align: center;
}

#header {
  font-size: 3rem;
  color: #4caf50;
  text-align: center;
  margin-top: 50px;
}

.hideElement {
  display: none;
}

button {
  font-family: Arial, sans-serif;
  font-size: 16px;
  padding: 10px 20px;
  border: 2px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background-color: #4caf50;
  color: white;
  border: 2px solid #4caf50;
}

.primary-btn:hover {
  background-color: white;
  color: #4caf50;
  border-color: #4caf50;
}

.primary-btn:active {
  background-color: #3e8e41;
  color: white;
  border-color: #3e8e41;
  transform: scale(0.98);
}

th,
td {
  padding: 10px;
  border: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  color: #333;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

td {
  color: #555;
}
</style>
