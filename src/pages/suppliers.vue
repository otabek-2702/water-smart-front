<script setup>
import axios from "@/axios";
import DeleteItemDialog from "@/components/DeleteItemDialog.vue";
import Skeleton from "@/components/Skeleton.vue";
import AddNewDrawer from "@/views/supplier/AddNewDrawer.vue";
import { watch } from "vue";
import { watchEffect } from "vue";
import { onMounted } from "vue";

const isFetching = ref(false);
const suppliers = ref([]);
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
    const response = await axios.get("suppliers", {
      params: {
        per_page: 30,
        page: current_page.value ?? 1,
        search: finalSearch.value,
      },
    });
    suppliers.value = response.data.suppliers;
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

// Add, Edit, Delete
const isAddNewDrawerVisible = ref(false);
const deleteData = ref({ id: 0, title: "" });

const handle = () => console.log("handle clicked");
const handleDelete = (data) => {
  deleteData.value = {
    id: data.id,
    title: data.name,
  };
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
          <VBtn @click="isAddNewDrawerVisible = true"> Add New </VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <VTable>
      <thead>
        <tr>
          <th class="text-uppercase">ID</th>
          <th>Name</th>
          <th>Address</th>
          <th>Phone</th>
          <th>Balance</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody v-if="!isFetching">
        <tr v-for="supplier in suppliers" :key="supplier.id">
          <td>
            {{ supplier.id }}
          </td>
          <td>
            {{ supplier.name }}
          </td>
          <td>
            {{ supplier.address }}
          </td>
          <td>
            {{ supplier.phone_number }}
          </td>
          <td>
            {{ supplier.balance }}
          </td>
          <td>
            <VIcon
              icon="bx-edit"
              size="28"
              color="success"
              class="me-2 cursor-pointer"
            />
            <VIcon
              icon="bx-trash"
              size="28"
              color="error"
              class="cursor-pointer"
              @click="handleDelete(supplier)"
            />
          </td>
        </tr>
      </tbody>

      <tfoot v-if="!isFetching && !suppliers.length">
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
        v-if="suppliers.length"
        :length="paginationData.total_pages"
        total-visible="7"
        v-model="current_page"
      />
    </VCardText>
  </VCard>
  <!-- :isDrawerVisible="isAddNewDrawerVisible"
  @update:isDrawerVisible="v => isAddNewDrawerVisible = v" -->
  <AddNewDrawer
    v-model:isDrawerVisible="isAddNewDrawerVisible"
    @fetchDatas="fetchData(true)"
  />

  <DeleteItemDialog
    v-model:id="deleteData.id"
    :title="deleteData.title"
    @fetchDatas="fetchData(true)"
  />
</template>
