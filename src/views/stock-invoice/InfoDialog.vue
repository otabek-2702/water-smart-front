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

const props = defineProps({ id: { type: Number, required: true } });
const emit = defineEmits(["fetchDatas", "id"]);

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
const isFetching = ref("");
const fetched_products = ref([]);
const itemForm = ref();
const formRef = ref();
const status = ref({});

const invoice_items = ref([]);

const handleDialogClose = () => {
  emit("update:id", 0);
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
};

const fetchDataById = async () => {
  try {
    isFetching.value = "fetchData";

    const {
      data: { stock_invoice },
    } = await axios.get(`stock_invoices/${props.id}`);

    invoice_items.value = stock_invoice.items?.map((el) => ({
      product_id: el.product.id,
      name: el.product.full_name,
      arrival_price: el.arrival_price,
      price: el.price,
      quantity: el.quantity,
      date_expire: el.date_expire,
    }));

    formData.value.supplier_id = stock_invoice.supplier.id;
    formData.value.trx_type = stock_invoice.trx_type.name;
    status.value = stock_invoice.status;
  } catch (error) {
    console.error(error);
  } finally {
    isFetching.value = "";
  }
};

watch(
  () => props.id,
  (newVal) => {
    if (newVal) fetchDataById();
  }
);

const onSubmit = async (confirmation = false) => {
  try {
    isFetching.value = "submit";

    await axios.put(`stock_invoices/${props.id}`, {
      supplier_id: formData.value.supplier_id,
      trx_type: formData.value.trx_type,
      items: invoice_items.value,
    });

    if (confirmation) {
      return true;
    }
    emit("fetchDatas");
    handleDialogClose();
  } catch (error) {
    console.error(error);
  } finally {
    isFetching.value = "";
  }
};

const onConfirm = async () => {
  try {
    const submitted = await onSubmit(true)

    if (!submitted) return;

    isFetching.value = "confirm";

    await axios.post(`stock_invoices/${props.id}/confirm`);

    emit("fetchDatas");
    handleDialogClose();
  } catch (error) {
    console.error(error);
  } finally {
    isFetching.value = "";
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
  <VDialog
    :model-value="!!props.id"
    @update:model-value="handleDialogClose"
    fullscreen
  >
    <VCard>
      <div class="d-flex flex-wrap pt-3">
        <VCardTitle> Create </VCardTitle>
        <VSpacer />
        <VBtn variant="text" icon="bx-x" @click="handleDialogClose" />
        <VDivider />
      </div>
      <VForm
        ref="formRef"
        @submit.prevent="onSubmit"
        v-if="isFetching !== 'fetchData'"
      >
        <VRow class="py-5 px-4" style="align-content: start">
          <VCol cols="3">
            <VSelect
              label="Select supplier"
              v-model="formData.supplier_id"
              :items="suppliers_list"
              item-title="name"
              item-value="id"
              :rules="[requiredValidator]"
              :readonly="status.name !== 'draft'"
            />
          </VCol>
          <VCol cols="7" />
          <VCol cols="2">
            <VSelect
              label="Select Trx type  "
              v-model="formData.trx_type"
              :items="trx_types"
              :rules="[requiredValidator]"
              :readonly="status.name !== 'draft'"
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
                <tr v-for="(item, i) in invoice_items" :key="item.product_id">
                  <td>{{ i + 1 }}</td>
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
          <VForm class="w-100" ref="itemForm" v-if="status.name === 'draft'">
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
          <VCol cols="12" class="d-flex pt-6 gap-4" v-if="status.name === 'draft'">
            <VSpacer />
            <VBtn type="submit" :loading="isFetching === 'submit'">
              Submit
            </VBtn>
            <VBtn
              @click="onConfirm"
              :loading="isFetching === 'confirm'"
              color="success"
            >
              Confirm
            </VBtn>

            <VBtn
              @click="onReject"
              :loading="isFetching === 'reject'"
              color="secondary"
            >
              Reject
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
      <VRow class="justify-center align-center h-100" v-else>
        <VProgressCircular indeterminate :size="44" :width="4" />
      </VRow>
    </VCard>
  </VDialog>
</template>

<style lang="scss"></style>
