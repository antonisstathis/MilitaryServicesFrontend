<template>
  <div class="login-container">
    <h1>Login</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="login">
      <input type="text" v-model="username" placeholder="Username" required />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
    <a href="#">Forgot your password?</a>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();

    const username = ref("");
    const password = ref("");
    const jwtToken = ref("");
    const errorMessage = ref("");

    const loginSuccessful = () => {
      if (jwtToken.value) {
        localStorage.setItem("jwtToken", jwtToken.value);
        router.push("/home");
      } else {
        console.error("JWT Token not found in response.");
      }
    };

    const login = async () => {
      try {
        errorMessage.value = "";

        const response = await axios.post(
          "/performLogin",
          {
            username: username.value,
            password: password.value,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.status === 200) {
          jwtToken.value = response.data.token;
          loginSuccessful();
        } else {
          errorMessage.value = "An error occurred. Please try again.";
        }
      } catch (error) {
        console.error("Login error:", error);

        if (error.response?.status === 401) {
          errorMessage.value = "Invalid username or password";
        } else {
          errorMessage.value = "An error occurred. Please try again.";
        }
      }
    };

    return {
      username,
      password,
      jwtToken,
      errorMessage,
      login,
    };
  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(to right, #43a047, #76c893);
  display: flex;
  justify-content: center; /* Horizontally center */
  align-items: center; /* Vertically center */
  height: 100vh; /* Full screen height */
  margin: 0;
  color: #fff;
}

.login-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 20px 30px;
  width: 100%;
  max-width: 400px; /* Keep the form width max 400px for better readability */
  text-align: center;
  margin: 20px; /* Adds a little margin around the form for responsiveness */
}

/* Form title */
.login-container h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Input fields */
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: 1rem;
}

/* Placeholder color */
input::placeholder {
  color: #bbb;
}

/* Button styles */
button {
  background-color: #43a047;
  border: none;
  color: white;
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388e3c;
}

/* Link styles */
.login-container a {
  color: #42a5f5; /* Light blue color */
  text-decoration: none;
  display: inline-block;
  margin-top: 15px;
  font-size: 0.9rem;
}

.login-container a:hover {
  text-decoration: underline;
  color: #1e88e5; /* Darker blue on hover */
}

.error-message {
  background: #ffebee;
  color: #d32f2f;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

/* Show error message when there's an error */
.error-message:empty {
  display: none;
}

.error-message:not(:empty) {
  opacity: 1;
}
</style>
