import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/components/SignIn/LoginPage.vue";
import SoldiersList from "@/components/SoldiersList/SoldiersList.vue";
import SoldierForm from "@/components/SoldierForm/SoldierForm.vue";
import ServicesOfUnit from "@/components/ServicesOfUnit/ServicesOfUnit.vue";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/home",
      name: "home",
      component: SoldiersList,
    },
    {
      path: "/signIn",
      name: "signIn",
      component: LoginPage,
    },
    {
      path: "/soldierForm",
      name: "soldierForm",
      component: SoldierForm,
    },
    {
      path: "/servicesOfUnit",
      name: "servicesOfUnit",
      component: ServicesOfUnit,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/home",
    },
  ],
});

export default router;
