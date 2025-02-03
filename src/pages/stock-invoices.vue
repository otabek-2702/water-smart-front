<script setup>
import axios from "@/axios";
import Skeleton from "@/components/Skeleton.vue";
import AddNewDialog from "@/views/stock-invoice/AddNewDialog.vue";
import InfoDialog from "@/views/stock-invoice/InfoDialog.vue";
import { watch } from "vue";
import { onMounted } from "vue";
import { transformPrice, formatTimestamp } from "@/helpers";

const isFetching = ref(false);
const stock_invoices = ref([]);
const paginationData = ref({});
const current_page = ref(1);
const last_fetched_page = ref(null);
const search = ref("");
const finalSearch = ref("");

const fetchData = async (force) => {
  if (
    !force &&
    (isFetching.value || current_page.value === last_fetched_page.value)
  )
    return;

  try {
    isFetching.value = true;
    const response = await axios.get("stock_invoices", {
      params: {
        per_page: 30,
        page: current_page.value ?? 1,
        search: finalSearch.value,
      },
    });

    stock_invoices.value = response.data.stock_invoices;
    paginationData.value = response.data.meta.pagination;
    last_fetched_page.value = current_page.value;
  } catch (error) {
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => fetchData());

watch(current_page, () => fetchData());

watch(finalSearch, () => {
  current_page.value = 1;
  fetchData(true);
});

const handleInput = (val) => {
  if (!val && finalSearch.value) {
    finalSearch.value = "";
  }
};

// Add, Edit
const updateItemId = ref(0);

const resolveInvoiceStatus = (status) => {
  return {
    draft: "primary",
    rejected: "secondary",
    confirmed: "success",
  }[status];
};
</script>

<template>
  <VCard>
    <VCardText>
      <VRow>
        <VSpacer />
        <VCol cols="auto">
          <VTextField
            v-model="search"
            label="Search"
            style="min-width: 300px"
            density="compact"
            @keyup.enter="finalSearch = search"
            @update:model-value="handleInput"
          />
        </VCol>

        <VCol cols="auto">
          <AddNewDialog @fetchDatas="fetchData(true)" />
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VTable>
      <thead>
        <tr>
          <th class="text-uppercase">ID</th>
          <th>Supplier</th>
          <th>Status</th>
          <th>Trx type</th>
          <th>Total summ</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody v-if="!isFetching">
        <tr
          v-for="invoice in stock_invoices"
          :key="invoice.id"
          @click="updateItemId = invoice.id"
          class="cursor-pointer"
        >
          <td>
            {{ invoice.id }}
          </td>
          <td>
            {{ invoice.supplier.name }}
          </td>
          <td>
            <VChip
              variant="tonal"
              label
              :color="resolveInvoiceStatus(invoice.status.name)"
              class="mr-2"
            >
              {{ invoice.status.translate }}
            </VChip>
          </td>
          <td>{{ invoice.trx_type.translate }}</td>
          <td>{{ transformPrice(invoice.total_amount) }}</td>
          <td>{{ formatTimestamp(invoice.created_at) }}</td>
        </tr>
      </tbody>

      <tfoot v-if="!isFetching && !stock_invoices.length">
        <tr>
          <td colspan="15" class="text-center font-weight-bold">No Data</td>
        </tr>
      </tfoot>
      <Skeleton v-if="isFetching" :count="6" />
    </VTable>

    <VDivider />

    <VCardText class="d-flex">
      <VSpacer />
      <VPagination
        v-if="stock_invoices.length"
        :length="paginationData.total_pages"
        total-visible="7"
        v-model="current_page"
      />
    </VCardText>
  </VCard>

  <InfoDialog v-model:id="updateItemId" @fetchDatas="fetchData(true)" />
</template>
