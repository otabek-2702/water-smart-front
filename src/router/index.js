import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: { name: "Suppliers" } },
    {
      path: "/",
      component: () => import("../layouts/default.vue"),
      meta: {
        loginRequired: true,
      },
      children: [
        {
          path: "suppliers",
          name: "Suppliers",
          component: () => import("../pages/suppliers.vue"),
        },
        {
          path: "categories",
          name: "Categories",
          component: () => import("../pages/categories.vue"),
        },
        {
          path: "roles",
          name: "Roles",
          component: () => import("../pages/roles.vue"),
        },
        {
          path: "users",
          name: "Users",
          component: () => import("../pages/users.vue"),
        },
        {
          path: "stock-invoices",
          name: "StockInvoices",
          component: () => import("../pages/stock-invoices.vue"),
        },
      ],
    },
    {
      path: "/",
      component: () => import("../layouts/blank.vue"),
      children: [
        {
          name: "Login",
          path: "login",
          component: () => import("../pages/login.vue"),
        },

        {
          path: "/:pathMatch(.*)*",
          component: () => import("../pages/[...all].vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.loginRequired && !token) {
    next("/login");
  }
  next();
});

export default router;
