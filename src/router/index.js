import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/components/SignIn/LoginPage.vue";
import SoldiersServicesList from "@/components/SoldiersServicesList/SoldiersServicesList.vue";
import SoldiersList from "@/components/SoldiersList/SoldiersList.vue";
import SoldierForm from "@/components/SoldierForm/SoldierForm.vue";
import ServicesOfUnit from "@/components/ServicesOfUnit/ServicesOfUnit.vue";
import ServicesOfSoldier from "@/components/ServicesOfSoldier/ServicesOfSoldier.vue";
import AddSoldier from "@/components/AddSoldier/AddSoldier.vue";
import StatisticsTable from "@/components/Statistics/StatisticsTable.vue";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "app",
      component: LoginPage,
    },
    {
      path: "/home",
      name: "home",
      component: SoldiersServicesList,
    },
    {
      path: "/personnel",
      name: "personnel",
      component: SoldiersServicesList,
    },
    {
      path: "/soldiersList",
      name: "soldiersList",
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
      path: "/servicesOfSoldier",
      name: "servicesOfSoldier",
      component: ServicesOfSoldier,
    },
    {
      path: "/soldiersStats",
      name: "soldiersStats",
      component: StatisticsTable,
    },
    {
      path: "/addSoldier",
      name: "addSoldier",
      component: AddSoldier,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/signIn",
    },
  ],
});

export default router;
