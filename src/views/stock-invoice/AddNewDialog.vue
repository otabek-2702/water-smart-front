<script setup>
import axios from "@/axios";
import { fetchOptions, transformPrice } from "@/helpers";
import { debounce } from "@/utils";
import { watchEffect } from "vue";
import { watch } from "vue";
import { onMounted } from "vue";
import { transformToDate, removeSpaces } from "@/helpers";
import { computed } from "vue";
import { nextTick } from "vue";
import { requiredValidator, dateValidator } from "@/plugins/validators";

const emit = defineEmits(["fetchDatas"]);

const isDialogVisible = ref(false);
const formData = ref({
  supplier_id: null,
  trx_type: null,
  selected_product: null,
  product_search_input: null,
  arrival_price: null,
  price: null,
  quantity: null,
  date_expire: null,
});
const isFetchingProduct = ref(false);
const isFetching = ref(false);
const fetched_products = ref([]);
const itemForm = ref();
const formRef = ref();

const invoice_items = ref([]);

const handleModelUpdate = (val) => {
  isDialogVisible.value = !!val;
  if (!val) {
    invoice_items.value = [];
    formData.value = {
      supplier_id: null,
      trx_type: null,
      selected_product: null,
      product_search_input: null,
      arrival_price: null,
      price: null,
      quantity: null,
      date_expire: null,
    };
    nextTick(() => resetItemForm());
  }
};

const onSubmit = async () => {
  try {
    isFetching.value = true;

    await axios.post("stock_invoices", {
      supplier_id: formData.value.supplier_id,
      trx_type: formData.value.trx_type,
      items: invoice_items.value,
    });

    emit("fetchDatas");
    handleModelUpdate(false);
  } catch (error) {
    console.error(error);
  } finally {
    isFetching.value = false;
  }
};

const fetchProducts = async () => {
  try {
    isFetchingProduct.value = true;
    const response = await axios.get("products", {
      params: {
        search: formData.value.product_search_input,
        per_page: 50,
      },
    });

    fetched_products.value = response.data.products?.map((item) => ({
      title: item.full_name,
      value: item.id,
    }));
  } catch (error) {
    console.error(error);
  } finally {
    isFetchingProduct.value = false;
  }
};

const debouncedFetchProducts = debounce(fetchProducts, 500);

watch(
  () => formData.value.product_search_input,
  (newVal) => {
    if (newVal && !formData.value.selected_product) debouncedFetchProducts();
  }
);

const resetItemForm = () => {
  itemForm.value.reset();
  itemForm.value.resetValidation();
};

const addToList = async () => {
  const { valid } = await itemForm.value?.validate();
  if (!valid) return;

  const existingProduct = invoice_items.value?.find(
    (el) => el.product_id === formData.value.selected_product.value
  );
  if (existingProduct) {
    existingProduct.quantity =
      existingProduct.quantity + Number(formData.value.quantity);
    existingProduct.arrival_price = removeSpaces(formData.value.arrival_price);
    existingProduct.price = removeSpaces(formData.value.price);
    existingProduct.date_expire = formData.value.date_expire;

    resetItemForm();
    return;
  }

  invoice_items.value.push({
    product_id: formData.value.selected_product.value,
    name: formData.value.selected_product.title,
    arrival_price: removeSpaces(formData.value.arrival_price),
    price: removeSpaces(formData.value.price),
    quantity: +formData.value.quantity,
    date_expire: formData.value.date_expire,
  });
  resetItemForm();
};

const suppliers_list = ref();
const trx_types = [
  {
    value: "black",
    title: "Black",
  },
  {
    value: "white",
    title: "White",
  },
];
onMounted(async () => {
  suppliers_list.value = await fetchOptions("suppliers");
});

// Totals
const totalPrice = computed(() =>
  invoice_items.value?.reduce(
    (acc, el) => acc + el.arrival_price * el.quantity,
    0
  )
);

const totalQuantity = computed(() =>
  invoice_items.value?.reduce((acc, el) => acc + el.quantity, 0)
);
</script>

<template>
  <VBtn @click="handleModelUpdate(true)"> Open Dialog </VBtn>
  <VDialog
    :model-value="isDialogVisible"
    @update:model-value="handleModelUpdate"
    fullscreen
  >
    <VCard>
      <div class="d-flex flex-wrap pt-3">
        <VCardTitle> Create </VCardTitle>
        <VSpacer />
        <VBtn variant="text" icon="bx-x" @click="handleModelUpdate(false)" />
        <VDivider />
      </div>
      <VForm ref="formRef" @submit.prevent="onSubmit">
        <VRow class="py-5 px-4" style="align-content: start">
          <VCol cols="3">
            <VSelect
              label="Select supplier"
              v-model="formData.supplier_id"
              :items="suppliers_list"
              item-title="name"
              item-value="id"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="7" />
          <VCol cols="2">
            <VSelect
              label="Select Trx type  "
              v-model="formData.trx_type"
              :items="trx_types"
              :rules="[requiredValidator]"
            />
          </VCol>

          <VCol cols="12" class="pb-6">
            <VTable>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Arrival price</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Date expire</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice_items" :key="item.product_id">
                  <td>{{ item.product_id }}</td>
                  <td class="py-2" style="max-width: 500px">{{ item.name }}</td>
                  <td>{{ transformPrice(item.arrival_price) }}</td>
                  <td>{{ transformPrice(item.price) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.date_expire }}</td>
                </tr>
                <tr v-if="invoice_items?.length">
                  <td></td>
                  <td></td>
                  <td colspan="2">
                    <b>Total Price</b>: {{ transformPrice(totalPrice) }}
                  </td>
                  <td colspan="2">
                    <b>Total Quantity</b>: {{ transformPrice(totalQuantity) }}
                  </td>
                </tr>
              </tbody>

              <tfoot v-if="!invoice_items?.length">
                <tr>
                  <td colspan="15" class="text-center">
                    <b>No Data</b>
                  </td>
                </tr>
              </tfoot>
            </VTable>
            <VDivider />
          </VCol>
          <VForm class="w-100" ref="itemForm">
            <VRow>
              <VCol cols="4">
                <VAutocomplete
                  label="Search product"
                  v-model="formData.selected_product"
                  v-model:search="formData.product_search_input"
                  :items="fetched_products"
                  variant="filled"
                  :loading="isFetchingProduct"
                  no-filter
                  clearable
                  return-object
                  :rules="[requiredValidator]"
                ></VAutocomplete>
              </VCol>
              <VCol cols="2" class="d-flex align-center">
                <VTextField
                  label="Arrival price"
                  v-model="formData.arrival_price"
                  :value="transformPrice(formData.arrival_price, true)"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2" class="d-flex align-center">
                <VTextField
                  label="Price"
                  v-model="formData.price"
                  :value="transformPrice(formData.price, true)"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="1" class="d-flex align-center">
                <VTextField
                  label="Quantity"
                  v-model="formData.quantity"
                  type="number"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2" class="d-flex align-center">
                <VTextField
                  label="Date expire"
                  v-model="formData.date_expire"
                  :value="transformToDate(formData.date_expire, true)"
                  @keyup.enter="addToList"
                  :rules="[dateValidator]"
                />
              </VCol>
              <VCol cols="1" class="d-flex align-center">
                <VBtn
                  icon="mdi-plus"
                  style="border-radius: 5px"
                  color="success"
                  @click="addToList"
                >
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
          <VCol cols="12" class="d-flex pt-6">
            <VSpacer />
            <VBtn type="submit" :loading="isFetching"> Submit </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style lang="scss"></style>
