<script setup>
import axios from "@/axios";
import { requiredValidator } from "@/plugins/validators";
import { watch } from "vue";
import { nextTick } from "vue";
import { pick } from "@/utils";
import { fetchOptions } from "@/helpers";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:id", "fetchDatas"]);

const isValid = ref(false);
const formRef = ref();
const formData = ref({
  name: "",
  username: "",
  password: "",
  roles: [],
});
const isLoading = ref("fetchData");
const isPasswordVisible = ref(false);

const fetchDataById = async () => {
  try {
    isLoading.value = "fetchData";
    const response = await axios.get(`/users/${props.id}`);

    const {
      data: { user },
    } = response;

    formData.value = { ...user, roles: user.roles.map((el) => el.id) };
  } catch (error) {
    console.error(erro);
  } finally {
    isLoading.value = "";
  }
};

const onSubmit = async () => {
  if (!isValid.value) return;
  try {
    isLoading.value = "submit";

    await axios.put(`/users/${props.id}`, formData.value);

    emit("fetchDatas");
    handleModelUpdate(0);
  } catch (error) {
    console.error(erro);
  } finally {
    isLoading.value = "";
  }
};

const handleModelUpdate = (val) => {
  emit("update:id", val);

  if (val === false) {
    nextTick(() => {
      formRef.value?.reset();
      formRef.value?.resetValidation();
    });
  }
};

watch(
  () => props.id,
  (newVal) => {
    if (newVal) {
      fetchDataById();
    }
  }
);

const roles = ref([]);
onMounted(async () => {
  roles.value = await fetchOptions("roles");
});
</script>

<template>
  <VNavigationDrawer
    :model-value="!!props.id"
    location="end"
    style="width: 400px"
  >
    <VCard class="h-100">
      <VRow class="py-6 px-3 align-center">
        <VCardTitle> Edit </VCardTitle>
        <VSpacer />
        <VBtn variant="text" icon="bx-x" @click="handleModelUpdate(0)" />
        <VDivider />
      </VRow>
      <VForm
        @submit.prevent="onSubmit"
        v-model="isValid"
        ref="formRef"
        v-if="isLoading !== 'fetchData'"
      >
        <VRow class="px-3">
          <VCol cols="12">
            <VTextField
              label="Name"
              v-model="formData.name"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              label="User Name"
              v-model="formData.username"
              :rules="[requiredValidator]"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              label="Password"
              v-model="formData.password"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              autocomplete="new-password"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              multiple
              label="Roles"
              :items="roles"
              item-title="name"
              item-value="id"
              v-model="formData.roles"
            />
          </VCol>

          <VCol cols="12" class="d-flex gap-2">
            <VBtn
              type="submit"
              :loading="isLoading === 'submit'"
              class="custom-loader_color"
              >Submit</VBtn
            >
            <VBtn color="secondary" @click="handleModelUpdate(false)"
              >Cancel</VBtn
            >
          </VCol>
        </VRow>
      </VForm>
      <VRow class="justify-center align-center h-100" v-else>
        <VProgressCircular indeterminate :size="44" :width="4" />
      </VRow>
    </VCard>
  </VNavigationDrawer>
</template>

<style lang="scss">
.custom-loader_color .v-btn__loader > div {
  color: white !important;
}
</style>
