<template>
  <div id="app">
    <nav class="menu">
      <ul>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/personnel">Personnel</router-link></li>
        <li><router-link to="/soldiers">Soldiers</router-link></li>
        <li><router-link to="/services">Services</router-link></li>
      </ul>
    </nav>
    <div id="header">
      <h1>{{ unitName }}</h1>
      <button class="primary-btn" @click="newServices">New Services</button>
      <button class="primary-btn" @click="navigateTo('/soldierForm')">
        Add Soldier
      </button>
      <button class="primary-btn" @click="navigateTo('/home')">
        Services of Unit
      </button>
      <button class="logout-btn" @click="logout">Log Out</button>
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
            v-for="soldier in soldiers"
            :key="soldier.id"
            @click="selectSoldier(soldier)"
          >
            <td v-for="key in tableHeaders.slice(1)" :key="key">
              {{ soldier[key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      unitName: "",
      soldiers: [],
      tableHeaders: [],
    };
  },
  mounted() {
    this.getNameOfUnit();
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
        this.fetchSoldiers();
        this.unitName = await response.text();
      } catch (error) {
        console.error(error);
        alert(error);
      }
    },
    async fetchSoldiers() {
      const jwtToken = localStorage.getItem("jwtToken", this.jwtToken);
      try {
        const response = await fetch(`${this.$config.backEndUrl}getSoldiers`, {
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
          this.soldiers = data;
        }
      } catch (error) {
        console.error(error);
        alert(error);
      }
    },
    async newServices() {
      const jwtToken = localStorage.getItem("jwtToken", this.jwtToken);
      try {
        const response = await fetch(`${this.$config.backEndUrl}calc`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });
        const router = useRouter();
        if (!response.ok) router.push("/signIn");
        this.fetchSoldiers();
      } catch (error) {
        console.error(error);
        alert(error);
      }
    },
    async selectSoldier(soldier) {
      const jwtToken = localStorage.getItem("jwtToken", this.jwtToken);
      try {
        const response = await fetch(`${this.$config.backEndUrl}getSoldier`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(soldier),
        });
        if (!response.ok) this.$router.push("/signIn");
        const data = await response.json();
        localStorage.setItem("formData", JSON.stringify(data));
        this.$router.push("/soldierForm");
      } catch (error) {
        console.error("Request failed:", error);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push("/signIn");
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
</style>
