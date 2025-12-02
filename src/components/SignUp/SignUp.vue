<template>
  <div class="signup-container">
    <h1>Create Your Military Digital Identity</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- CSR GENERATION FORM -->
    <form @submit.prevent="submitSignup">
      <input type="text" v-model="username" placeholder="Username" required />

      <select v-model="authority" required>
        <option disabled value="">Select Authority</option>
        <option value="ROLE_SOLDIER">Soldier</option>
        <option value="ROLE_COMMANDER">Commander</option>
      </select>

      <input
        type="number"
        min="1"
        v-model="unit"
        placeholder="Unit ID"
        required
      />

      <button type="submit">Generate CSR</button>
    </form>

    <!-- SHOW AFTER CSR GENERATION -->
    <div v-if="csrGenerated" class="success-box">
      <h3>CSR Generated</h3>
      <p>Your Certificate Signing Request is ready.</p>
      <button @click="downloadCSR">Download CSR File</button>
    </div>

    <!-- FINALIZE SIGNUP SECTION -->
    <div class="finalize-section">
      <h3>Already received your certificate?</h3>
      <p>
        If you already visited the CA office and installed your CRT file, you
        can complete your registration.
      </p>

      <button class="finalize-btn" @click="goToFinalize">
        Finalize Registration
      </button>
    </div>

    <!-- BACK BUTTON -->
    <button class="back-btn" @click="goBack">← Back to Login</button>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  name: "SignUpPage",
  setup() {
    const router = useRouter();

    const username = ref("");
    const authority = ref("");
    const unit = ref("");
    const errorMessage = ref("");
    const csrGenerated = ref(false);
    const csrFileContent = ref(null);

    const submitSignup = async () => {
      errorMessage.value = "";

      try {
        const response = await axios.post(
          "/signup-request",
          {
            username: username.value,
            authority: authority.value,
            unit: unit.value,
          },
          { responseType: "blob" }
        );

        csrFileContent.value = response.data;
        csrGenerated.value = true;
      } catch (error) {
        console.error("Signup error:", error);
        errorMessage.value = "Failed to generate CSR. Check your inputs.";
      }
    };

    const downloadCSR = () => {
      const blob = new Blob([csrFileContent.value], {
        type: "application/x-pkcs10",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "user.csr";
      link.click();
    };

    const goToFinalize = () => {
      router.push("/signup-finalize");
    };

    const goBack = () => {
      router.push("/");
    };

    return {
      username,
      authority,
      unit,
      errorMessage,
      submitSignup,
      csrGenerated,
      downloadCSR,
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
  color: #e0f7fa;
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

/* FINALIZE SECTION */
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

/* BACK BUTTON */
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

.success-box h3 {
  margin-bottom: 8px;
}
</style>
