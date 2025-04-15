<template>
  <div id="app">
    <nav class="menu">
      <ul>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/personnel">Personnel</router-link></li>
        <li><router-link to="/soldiers">Soldiers</router-link></li>
        <li><router-link to="/servicesOfUnit">Services</router-link></li>
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
      <button class="primary-btn" @click="newServices">New Services</button>
      <button class="primary-btn" @click="navigateTo('/servicesOfUnit')">
        Services of Unit
      </button>
      <button class="primary-btn" @click="fetchSoldiers">Last Services</button>
      <input type="date" id="date" @change="fetchPrevCalculation($event)" />
      <button class="logout-btn" @click="logout">Log Out</button>
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
import axios from "axios";

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
    this.fetchSoldiers();
  },
  methods: {
    changeLanguage() {
      localStorage.setItem("lang", this.locale);
      this.fetchSoldiers();
    },
    async getNameOfUnit() {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        this.$router.push("/signIn");
        return;
      }
      try {
        const response = await axios.get(
          `${this.$config.backEndUrl}getNameOfUnit`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        this.unitName = response.data;
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
      }
    },
    async fetchTitles(prefix) {
      const jwtToken = localStorage.getItem("jwtToken");
      const lang = localStorage.getItem("lang") || "en";
      this.locale = lang;
      try {
        const response = await axios.get(`${this.$config.backEndUrl}titles`, {
          params: {
            prefix: prefix,
            lang: lang,
          },
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        if (data.length) this.tableHeaders = data;
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
        alert(error);
      }
    },
    async fetchSoldiers() {
      await this.fetchTitles("title.lastcalc");
      const jwtToken = localStorage.getItem("jwtToken");
      try {
        const lang = localStorage.getItem("lang");
        const response = await axios.get(
          `${this.$config.backEndUrl}getSoldiers`,
          {
            params: {
              lang: lang,
            },
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        if (data.length) this.soldiers = Object.values(data);

        const dateValue = this.soldiers[0].date;
        const formattedDate = dateValue.split("-").reverse().join("-");
        const date = new Date(formattedDate);
        document.getElementById("date").value = date
          .toISOString()
          .split("T")[0];
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
        alert(error);
      }
    },
    async fetchPrevCalculation(event) {
      const lang = localStorage.getItem("lang");
      await this.fetchTitles("title.prevcalc");
      const selectedDate = event.target.value;
      const jwtToken = localStorage.getItem("jwtToken");
      try {
        const response = await axios.get(
          `${this.$config.backEndUrl}getPreviousCalculation`,
          {
            params: {
              date: selectedDate,
              lang: lang,
            },
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        if (data.length) this.soldiers = Object.values(data);
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
        alert(error);
      }
    },
    async newServices() {
      const jwtToken = localStorage.getItem("jwtToken");
      try {
        await axios.get(`${this.$config.backEndUrl}calc`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });
        this.fetchSoldiers();
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
        alert(error);
      }
    },
    async selectSoldier(soldier) {
      const jwtToken = localStorage.getItem("jwtToken");
      try {
        const response = await axios.post(
          `${this.$config.backEndUrl}getSoldier`,
          soldier,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        localStorage.setItem("formData", JSON.stringify(data));
        this.$router.push("/soldierForm");
      } catch (error) {
        console.error("Request failed:", error);
        if (error.response && error.response.status === 401) {
          this.$router.push("/signIn");
          return;
        }
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
