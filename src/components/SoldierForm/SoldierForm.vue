<template>
  <div id="background">
    <div class="add-container">
      <h1>Add Soldier</h1>
      <form @submit.prevent="saveSoldier">
        <input type="hidden" v-model="soldier.id" placeholder="Id" disabled />
        <input
          type="text"
          v-model="soldier.name"
          placeholder="Name"
          readonly
          required
        />
        <input
          type="text"
          v-model="soldier.surname"
          placeholder="Surname"
          readonly
          required
        />

        <select id="situationSelect" v-model="soldier.situation">
          <option value="" disabled selected>Select an option</option>
          <option value="armed">armed</option>
          <option value="unarmed">unarmed</option>
        </select>

        <select id="activeSelect" v-model="soldier.active">
          <option value="" disabled selected>Select an option</option>
          <option value="active">active</option>
          <option value="free of duty">free of duty</option>
        </select>

        <button type="submit">Save</button>
        <button @click="goToSoldierForm" class="back-btn">Back</button>
      </form>
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

    const soldier = ref({
      id: "",
      name: "",
      surname: "",
      situation: "",
      active: "",
    });

    onMounted(() => {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        router.push("/signIn");
        return;
      }

      const storedData = localStorage.getItem("formData");
      if (storedData) {
        soldier.value = JSON.parse(storedData);
        localStorage.removeItem("formData");
      }
    });

    const saveSoldier = async () => {
      try {
        await axios.post("changeSoldSituation", soldier.value);
        router.push("/home");
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          router.push("/signIn");
        } else {
          alert(error);
        }
      }
    };

    return {
      soldier,
      saveSoldier,
    };
  },
};
</script>

<style scoped>
#background {
  height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(
    135deg,
    #e0f2fe,
    #f0fdf4
  ); /* Soft Blue to Soft Green */
}

.add-container {
  background-color: #fff; /* White background for the container */
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: auto;
}

h1 {
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 20px;
}

input,
select {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.back-btn {
  display: block;
  text-align: center;
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: #f44336;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #d32f2f;
}
</style>
