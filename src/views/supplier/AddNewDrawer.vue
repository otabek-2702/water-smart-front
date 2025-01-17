<script setup>
import axios from "@/axios";
import { requiredValidator } from "@/plugins/validators";
import { nextTick } from "vue";

const props = defineProps({
  isDrawerVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isDrawerVisible", "fetchDatas"]);

const isValid = ref(false);
const formRef = ref();
const formData = ref({
  name: "",
  address: "",
  phone_number: "",
});

const onSubmit = async () => {
  if (!isValid.value) return;

  const response = await axios.post("/suppliers", formData.value);
  if (response.status === 201) {
    emit("fetchDatas");
    handleModelUpdate(false);
  }
  console.log(response);
};

const handleModelUpdate = (val) => {
  emit("update:isDrawerVisible", val);

  if (val === false) {
    nextTick(() => {
      formRef.value?.reset();
      formRef.value?.resetValidation();
    });
  }
};
</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDrawerVisible"
    location="end"
    style="width: 400px"
  >
    <VCard class="h-100">
      <VRow class="py-6 px-3 align-center">
        <VCardTitle> Create </VCardTitle>
        <VSpacer />
        <VBtn
          variant="text"
          icon="bx-x"
          @click="handleModelUpdate(false)"
        />
        <VDivider />
      </VRow>
      <VForm @submit.prevent="onSubmit" v-model="isValid" ref="formRef">
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
              label="Address"
              v-model="formData.address"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              label="Phone Number"
              v-model="formData.phone_number"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" class="d-flex gap-2">
            <VBtn type="submit">Submit</VBtn>
            <VBtn color="secondary" @click="handleModelUpdate(false)"
              >Cancel</VBtn
            >
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </VNavigationDrawer>
</template>

<style lang="scss"></style>
