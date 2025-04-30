<template>
  <div
    v-if="messageStore.visible"
    :class="['message-popup', messageStore.type]"
  >
    <p>{{ messageStore.message }}</p>
  </div>
</template>

<script setup>
import { useMessageStore } from "@/stores/useMessageStore";
const messageStore = useMessageStore();
</script>

<style scoped>
.message-popup {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
  max-width: 600px;
  width: 50%;
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  z-index: 1000;
  text-align: center;
  font-size: 1.1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease-out;
}

/* Message types */
.message-popup.success {
  background-color: #4caf50;
}
.message-popup.error {
  background-color: #f44336;
}
.message-popup.warning {
  background-color: #ff9800;
}
.message-popup.info {
  background-color: #2196f3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
