import { defineStore } from "pinia";
import { ref } from "vue";

export const useMessageStore = defineStore("message", () => {
  const message = ref("");
  const type = ref("success");
  const visible = ref(false);

  function show(msg, msgType = "success", duration = 2300) {
    message.value = msg;
    console.log("show method: " + message.value);
    type.value = msgType;
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, duration);
  }

  return { message, type, visible, show };
});
