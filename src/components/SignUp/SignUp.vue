<template>
  <div class="signup-container">
    <h1>Create Your Military Digital Identity</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="finalize-section">
      <h3>Personal Information</h3>

      <input v-model="name" placeholder="Name" required />
      <input v-model="surname" placeholder="Surname" required />
      <input v-model="patronymic" placeholder="Patronymic" required />
      <input v-model="matronymic" placeholder="Matronymic" required />
      <input
        v-model="registrationNumber"
        placeholder="Registration Number"
        required
      />
      <input v-model="telephone" placeholder="Telephone" required />
      <input v-model="city" placeholder="City" required />
      <input v-model="address" placeholder="Address" required />

      <select v-model="situation" required>
        <option disabled value="">Situation</option>
        <option value="armed">Armed</option>
        <option value="unarmed">Unarmed</option>
      </select>

      <h3 style="margin-top: 25px">Choose Password</h3>

      <input
        type="password"
        v-model="finalizePassword"
        placeholder="Password"
        required
      />

      <input
        type="password"
        v-model="finalizePasswordRepeat"
        placeholder="Repeat Password"
        required
      />

      <p v-if="passwordsFilled && !passwordsMatch" class="password-error">
        Passwords do not match.
      </p>

      <button
        class="finalize-btn"
        :disabled="!formValid"
        @click="finalizeSignup"
      >
        Finalize Registration
      </button>
    </div>

    <button class="back-btn" @click="goBack">← Back to Login</button>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  name: "SignUpPage",
  setup() {
    const router = useRouter();

    const name = ref("");
    const surname = ref("");
    const patronymic = ref("");
    const matronymic = ref("");
    const registrationNumber = ref("");
    const telephone = ref("");
    const city = ref("");
    const address = ref("");
    const situation = ref("");

    const finalizePassword = ref("");
    const finalizePasswordRepeat = ref("");

    const errorMessage = ref("");

    const passwordsMatch = computed(
      () =>
        finalizePassword.value &&
        finalizePasswordRepeat.value &&
        finalizePassword.value === finalizePasswordRepeat.value
    );

    const passwordsFilled = computed(
      () => finalizePassword.value && finalizePasswordRepeat.value
    );

    const formValid = computed(() => {
      return (
        name.value &&
        surname.value &&
        patronymic.value &&
        matronymic.value &&
        registrationNumber.value &&
        telephone.value &&
        city.value &&
        address.value &&
        situation.value &&
        passwordsMatch.value
      );
    });

    const finalizeSignup = async () => {
      if (!formValid.value) {
        errorMessage.value = "Please complete all required fields correctly.";
        return;
      }

      try {
        await axios.post("/signUp", {
          name: name.value,
          surname: surname.value,
          patronymic: patronymic.value,
          matronymic: matronymic.value,
          registrationNumber: registrationNumber.value,
          telephone: telephone.value,
          city: city.value,
          address: address.value,
          situation: situation.value,
          password: finalizePassword.value,
        });

        router.push("/login");
      } catch (err) {
        console.error(err);
        errorMessage.value = "Registration failed. Please try again.";
      }
    };

    const goBack = () => router.push("/");

    return {
      name,
      surname,
      patronymic,
      matronymic,
      registrationNumber,
      telephone,
      city,
      address,
      situation,
      finalizePassword,
      finalizePasswordRepeat,
      passwordsMatch,
      passwordsFilled,
      formValid,
      errorMessage,
      finalizeSignup,
      goBack,
    };
  },
};
</script>

<style scoped>
.signup-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 25px 35px;
  max-width: 450px;
  margin: auto;
  color: #556b2f;
  text-align: center;
}

input,
select {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: none;
}

button {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.finalize-btn {
  background-color: #0277bd;
  color: white;
  margin-top: 15px;
}

.finalize-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.password-error {
  color: #ff5252;
  font-weight: bold;
}

.back-btn {
  background-color: #757575;
  margin-top: 20px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
}
</style>
