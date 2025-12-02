<template>
  <div class="signup-container">
    <h1>Create Your Military Digital Identity</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- SIGNUP FORM -->
    <form @submit.prevent="uploadCSR">
      <input type="text" v-model="username" placeholder="Username" required />

      <select v-model="authority" required>
        <option disabled value="">Select Authority</option>
        <option value="ROLE_SOLDIER">Soldier</option>
        <option value="ROLE_COMMANDER">Commander</option>
      </select>

      <input type="text" v-model="unit" placeholder="Unit Name" required />

      <label class="csr-label">Upload CSR (.csr)</label>
      <input type="file" accept=".csr,.pem,.txt" @change="handleCSR" required />

      <button type="submit">Submit CSR</button>
    </form>

    <div v-if="csrAccepted" class="success-box">
      <h3>CSR Uploaded</h3>
      <p>Your certificate will be issued by the officer/CA.</p>
    </div>

    <!-- FINALIZE REGISTRATION -->
    <div class="finalize-section">
      <h3>Already received your certificate?</h3>
      <p>Install your CRT file in your browser, then complete registration:</p>

      <input
        type="password"
        v-model="finalizePassword"
        placeholder="Password"
      />

      <input
        type="password"
        v-model="finalizePasswordRepeat"
        placeholder="Repeat Password"
      />

      <p v-if="passwordsFilled && !passwordsMatch" class="password-error">
        Passwords do not match.
      </p>

      <button
        class="finalize-btn"
        :disabled="!passwordsMatch"
        @click="goToFinalize"
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

    const username = ref("");
    const authority = ref("");
    const unit = ref("");

    const csrFile = ref(null);
    const csrAccepted = ref(false);
    const errorMessage = ref("");

    const finalizePassword = ref("");
    const finalizePasswordRepeat = ref("");

    const passwordsMatch = computed(() => {
      return (
        finalizePassword.value &&
        finalizePasswordRepeat.value &&
        finalizePassword.value === finalizePasswordRepeat.value
      );
    });

    const passwordsFilled = computed(() => {
      return finalizePassword.value && finalizePasswordRepeat.value;
    });

    const handleCSR = (event) => {
      csrFile.value = event.target.files[0];
    };

    const uploadCSR = async () => {
      errorMessage.value = "";

      if (!csrFile.value) {
        errorMessage.value = "Please upload a CSR file.";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("csr", csrFile.value);
        formData.append("username", username.value);
        formData.append("authority", authority.value);
        formData.append("unit", unit.value);

        await axios.post("/signup-request", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        csrAccepted.value = true;
      } catch (error) {
        console.error(error);
        errorMessage.value = "Failed to upload CSR.";
      }
    };

    const goToFinalize = () => {
      if (!passwordsMatch.value) {
        errorMessage.value = "Passwords do not match.";
        return;
      }
      router.push("/signup-finalize");
    };

    const goBack = () => router.push("/");

    return {
      username,
      authority,
      unit,
      csrFile,
      handleCSR,
      uploadCSR,
      csrAccepted,
      finalizePassword,
      finalizePasswordRepeat,
      passwordsMatch,
      passwordsFilled,
      errorMessage,
      goToFinalize,
      goBack,
    };
  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(to right, #2c5364, #0f2027);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  color: #fff;
}

.signup-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 25px 35px;
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.signup-container h1 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  font-weight: bold;
  color: #9fbf3b;
}

input,
select {
  width: 100%;
  padding: 12px;
  margin: 12px 0;
  border: none;
  border-radius: 8px;
  outline: none;
  background: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
}

input::placeholder {
  color: #666;
}

.csr-label {
  font-size: 0.95rem;
  color: #9fbf3b;
  margin-top: 10px;
  display: block;
  text-align: left;
}

button {
  background-color: #2e7d32;
  border: none;
  color: white;
  padding: 12px 15px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #1b5e20;
}

.finalize-section {
  margin-top: 35px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.finalize-btn {
  background-color: #0277bd;
}

.finalize-btn:hover {
  background-color: #01579b;
}

.password-error {
  color: #ff5252;
  font-weight: bold;
  margin-top: -5px;
}

.back-btn {
  background-color: #757575;
  margin-top: 25px;
}

.back-btn:hover {
  background-color: #616161;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  font-weight: bold;
}

.success-box {
  background: rgba(200, 230, 201, 0.3);
  padding: 15px;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #81c784;
  color: #e8f5e9;
}
</style>
