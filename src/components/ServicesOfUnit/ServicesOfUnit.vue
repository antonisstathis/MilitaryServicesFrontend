<template>
  <div id="header">
    <h1>{{ unitName }}</h1>
    <button class="primary-btn" @click="navigateTo('/home')">
      Add Services
    </button>
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
</template>

<script>
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      unitName: "",
      tableHeaders: [],
      services: [],
    };
  },
  mounted() {
    this.getNameOfUnit();
    this.fetchServicesOfUnit();
  },
  methods: {
    async getNameOfUnit() {
      const router = useRouter();
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }
      try {
        const response = await fetch(
          `${this.$config.backEndUrl}getNameOfUnit`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) router.push("/signIn");
        this.unitName = await response.text();
      } catch (error) {
        console.error(error);
        alert(error);
      }
    },
    async fetchServicesOfUnit() {
      const jwtToken = localStorage.getItem("jwtToken", this.jwtToken);
      const response = await fetch(`${this.$config.backEndUrl}getServices`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });
      const router = useRouter();
      if (!response.ok) router.push("/signIn");
      const data = await response.json();
      if (data.length) {
        this.tableHeaders = Object.keys(data[0]);
        this.services = data;
      }
    },
    navigateTo(path) {
      this.$router.push(path);
    },
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
</style>
