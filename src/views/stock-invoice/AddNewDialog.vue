<script setup>
import axios from "@/axios";
import { fetchOptions, transformPrice } from "@/helpers";
import { debounce } from "@/utils";
import { watchEffect } from "vue";
import { watch } from "vue";
import { onMounted } from "vue";
import { transformToDate } from "@/helpers";

const isDialogVisible = ref(true);
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
const fetched_products = ref([]);

const invoice_items = ref();

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

const debouncedFetchProducts = debounce(fetchProducts, 500); // Create once!

watch(
  () => formData.value.product_search_input,
  (newVal) => {
    if (newVal) debouncedFetchProducts(); // Call the existing debounced function
  }
);

const addToList = () => {
  const existingProduct = invoice_items.value.find(
    (el) => el.product_id === formData.value.selected_product
  );
  if (existingProduct) {
    existingProduct.quantity =
      existingProduct.quantity + formData.value.quantity;
    return;
  }
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
</script>

<template>
  <VBtn @click="isDialogVisible = true"> Open Dialog </VBtn>
  <VDialog v-model="isDialogVisible" fullscreen>
    <VCard>
      <div class="d-flex flex-wrap pt-3">
        <VCardTitle> Create </VCardTitle>
        <VSpacer />
        <VBtn variant="text" icon="bx-x" @click="handleModelUpdate(false)" />
        <VDivider />
      </div>
      <VRow class="py-5 px-4" style="align-content: start">
        <VCol cols="3">
          <VSelect
            label="Select supplier"
            v-model="formData.supplier_id"
            :items="suppliers_list"
            item-title="name"
            item-value="id"
          />
        </VCol>
        <VCol cols="7" />
        <VCol cols="2">
          <VSelect
            label="Select Trx type  "
            v-model="formData.trx_type"
            :items="trx_types"
          />
        </VCol>

        <VCol cols="12">
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
            <tbody></tbody>

            <tfoot>
              <tr>
                <td colspan="15" class="text-center">
                  <b>No Data</b>
                </td>
              </tr>
            </tfoot>
          </VTable>
        </VCol>
        <VDivider />
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
          ></VAutocomplete>
        </VCol>
        <VCol cols="2">
          <VTextField
            label="Arrival price"
            v-model="formData.arrival_price"
            :value="transformPrice(formData.arrival_price, true)"
          />
        </VCol>
        <VCol cols="2">
          <VTextField
            label="Price"
            v-model="formData.price"
            :value="transformPrice(formData.price, true)"
          />
        </VCol>
        <VCol cols="1">
          <VTextField
            label="Quantity"
            v-model="formData.quantity"
            type="number"
          />
        </VCol>
        <VCol cols="2">
          <VTextField
            label="Date expire"
            v-model="formData.date_expire"
            :value="transformToDate(formData.date_expire, true)"
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
    </VCard>
  </VDialog>
</template>

<style lang="scss"></style>
