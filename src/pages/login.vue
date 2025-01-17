<script setup>
import logo from "@images/logo.svg?raw";
import { requiredValidator } from "@/plugins/validators";
import axios from "@axios/index";
import { useRouter } from "vue-router";

const form = ref({
  username: "",
  password: "",
});

const router = useRouter();

const formRef = ref();
const isValid = ref();

const onSubmit = async (e) => {
  if (!isValid.value) return;
  
  try {
    const response = await axios.post("/auth/login", form.value);

    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("userData", JSON.stringify(response.data.user));
    router.push({ name: "Suppliers" });
  } catch (error) {
    console.error(error);
  }
};

const isPasswordVisible = ref(false);
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div class="d-flex text-primary" v-html="logo" />
          </div>
        </template>
        {{ isValid }}

        <VCardTitle class="text-2xl font-weight-bold"> sneat </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 mb-1">Welcome to sneat! 👋🏻</h5>
        <p class="mb-0">
          Please sign-in to your account and start the adventure
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="onSubmit" ref="formRef" v-model="isValid">
          <VRow>
            <!-- login -->
            <VCol cols="12">
              <VTextField
                v-model="form.username"
                autofocus
                label="Login"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredValidator]"
              />

              <!-- login button -->
            </VCol>
            <VCol cols="12">
              <VBtn block type="submit"> Login </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
