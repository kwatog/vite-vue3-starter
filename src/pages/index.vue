<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TableLite from '~/components/TableLite.vue'

const name = ref('')

const router = useRouter()
const go = () => {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}

const { t } = useI18n()

const table = reactive({
  columns: [
    {
      label: 'ID',
      field: 'id',
      width: '3%',
      sortable: true,
      isKey: true,
    },
    {
      label: 'Name',
      field: 'name',
      width: '10%',
      sortable: true,
      display(row) {
        return (
          `<a href="#" data-id="${row.user_id}" class="is-rows-el name-btn">${row.name}</button>`
        )
      },
    },
    {
      label: 'Email',
      field: 'email',
      width: '15%',
      sortable: true,
    },
    {
      label: '',
      field: 'quick',
      width: '10%',
      display(row) {
        return (
          `<button type="button" data-id="${row.user_id}" class="is-rows-el quick-btn">Button</button>`
        )
      },
    },
  ],
  rows: [
    {
      id: 1,
      name: 'TEST1',
    },
    {
      id: 2,
      name: 'TEST2',
    },
  ],
  totalRecordCount: 2,
  sortable: {
    order: 'id',
    sort: 'asc',
  },
  messages: {
    pagingInfo: 'Showing {0}-{1} of {2}',
    pageSizeChangeLabel: 'Row count:',
    gotoPageLabel: 'Go to page:',
    noDataAvailable: 'No data',
  },
})

const updateCheckedRows = (rowsKey) => {
  // do your checkbox click event
  console.log(rowsKey)
}

</script>

<template>
  <div>
    <p class="text-4xl">
      <carbon-scooter class="inline-block" />
    </p>
    <p>
      <a rel="noreferrer" href="https://github.com/ctholho/vitespa" target="_blank">
        Vitespa
      </a>
    </p>
    <p>
      <em class="text-sm opacity-75">{{ t('intro.desc') }}</em>
    </p>

    <div class="py-4" />

    <input
      id="input"
      v-model="name"
      :placeholder="t('intro.whats-your-name')"
      :aria-label="t('intro.whats-your-name')"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
      @keydown.enter="go"
    >
    <label class="hidden" for="input">{{ t('intro.whats-your-name') }}</label>

    <div>
      <button
        class="m-3 text-sm btn"
        :disabled="!name"
        @click="go"
      >
        {{ t('button.go') }}
      </button>
    </div>

    <table-lite
      :is-static-mode="true"
      :has-checkbox="true"
      :columns="table.columns"
      :rows="table.rows"
      :total="table.totalRecordCount"
      :sortable="table.sortable"
      :messages="table.messages"
      @return-checked-rows="updateCheckedRows"
    ></table-lite>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
</route>
