<template>
  <div class="data-table">
    <div class="data-table-inner">
      <!-- Datatable Header -->
      <div
        v-if="header && ($slots.header || exportable || limitable || searchable || rangeable || (filterable && filters.length))"
        class="px-8 pb-4 pt-4"
      >
        <slot name="header">
          <!-- Row One -->
          <div v-if="exportable" class="flex">
            <!-- Table Export -->
            <template v-if="exportable">
              <div class="w-full flex justify-center data-table-control mb-3 ml-auto">
                <!-- Export Original Data -->
                <button type="button" class="btn btn-purple-outline btn-sm mr-2" @click.prevent="exportAll">
                  <ion-icon name="cloud-download-outline" class="text-base" />
                  <span class="ml-2">Export All Results</span>
                </button>
                <!-- Export Original Data -->

                <!-- Export Rendered Data -->
                <button type="button" class="btn btn-blue-outline btn-sm" @click.prevent="exportData">
                  <ion-icon name="cloud-download-outline" class="text-base" />
                  <span class="ml-2">Export Filtered Results</span>
                </button>
                <!-- Export Rendered Data -->
              </div>
            </template>
            <!-- Table Export -->
          </div>
          <!-- Row One -->

          <!-- Row Two -->
          <div v-if="limitable || searchable" class="flex">
            <!-- Limitable -->
            <template v-if="limitable">
              <div class="w-full data-table-control mb-3">
                <div class="form-group">
                  <label>
                    Show
                    &nbsp;
                    <select v-model="itemsPerPage" type="text" class="custom-select custom-select-sm">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                    </select>
                    &nbsp;
                    Results
                  </label>
                </div>
              </div>
            </template>
            <!-- Limitable -->

            <!-- Searchable -->
            <template v-if="searchable">
              <div class="w-full data-table-control mb-3">
                <div class="form-group">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="input"
                    placeholder="Search Records"
                    @keyup.enter="searchEnterKey"
                  >
                </div>
              </div>
            </template>
            <!--   -->
          </div>
          <!-- Row Two -->

          <!-- Row Three -->
          <div v-if="rangeable || (filterable && filters.length)" class="flex">
            <!-- Rangeable -->
            <template v-if="rangeable">
              <div class="w-full data-table-control mb-3">
                <date-range-picker
                  ref="picker"
                  v-model="dateRange.value"
                  :locale-data="{ firstDay: 1, format: dateRange.format }"
                  :single-date-picker="dateRange.singleDatePicker"
                  :auto-apply="dateRange.autoApply"
                  opens="center"
                  :append-to-body="true"
                  @update="dateRange.updateValues"
                  @toggle="() => {}"
                />
              </div>
            </template>
            <!-- Rangeable -->

            <!-- Filterable -->
            <template v-if="filterable && filters.length">
              <div class="w-full data-table-control mb-3">
                <!-- Using Dropdown -->
                <template v-if="canUseDropdownForFilters">
                  <div class="dropdown dropleft">
                    <button
                      type="button"
                      class="btn btn-blue-outline"
                      dropdown
                    >
                      Filters
                    </button>
                    <ul class="dropdown-menu">
                      <template v-for="(filter, n) in filters">
                        <a
                          :key="n"
                          href="javascript: void(0)"
                          class="dropdown-menu-item"
                          :class="{ active: currentFilter === filter }"
                          @click.prevent="clickedFilter(filter)"
                          v-html="filter.title"
                        ></a>
                      </template>
                    </ul>
                  </div>
                </template>
                <!-- Using Dropdown -->

                <!-- Using Tags -->
                <template v-else>
                  <div class="mt-3 w-full">
                    <span class="font-bold mb-2 mr-2 text-sm uppercase w-full">Filters:</span>
                    <div class="flex flex-row flex-wrap">
                      <template v-for="(filter, n) in filters">
                        <a
                          :key="n"
                          href="javascript: void(0)"
                          class="filter-class"
                          :class="{
                            active: currentFilter === filter,
                          }"
                          @click.prevent="clickedFilter(filter)"
                          v-html="filter.title"
                        ></a>
                      </template>
                    </div>
                  </div>
                </template>
                <!-- Using Tags -->
              </div>
            </template>
            <!-- Filterable -->
          </div>
          <!-- Row Three -->
        </slot>
      </div>
      <!-- Datatable Header -->

      <!-- Datatable Body -->
      <template>
        <div class="datatable-content mb-6">
          <!-- Loading State -->
          <template v-if="isLoading">
            <slot name="loading">
              <!-- <loader /> -->
              <div class="data-table-loading">
                <div class="data-table-loading-spinner"></div>
                <div class="data-table-loading-text">
                  Loading Data
                </div>
              </div>
            </slot>
          </template>
          <!-- Loading State -->

          <!-- Table Content -->
          <template v-else>
            <div class="table-responsive">
              <table class="table" :class="{'table-interactable': clickable, [tableStyle]: true}">
                <!-- Table Header -->
                <thead v-if="showHeadings">
                  <tr>
                    <!-- Selectable Heading -->
                    <template v-if="selectable">
                      <th>
                        <label class="custom-control custom-checkbox">
                          <input ref="selectAll" type="checkbox" class="custom-control-input" @change="selectAll">
                          <span class="custom-control-label"></span>
                        </label>
                      </th>
                    </template>
                    <!-- Selectable Heading -->

                    <!-- Row Index Heading -->
                    <template v-if="index">
                      <th
                        class="sortable"
                        :class="{sort: sortColumn === '#', 'asc': sortColumn === '#' && asc, 'desc': sortColumn === '#' && !asc}"
                        @click="sortIndex()"
                      >
                        # <span class="sort-icon"></span>
                      </th>
                    </template>
                    <!-- Row Index Heading -->

                    <!-- Render Table Headings -->
                    <template v-for="(th, n) in headings">
                      <template v-if="th.sortable">
                        <th
                          v-if="th.show"
                          :key="n"
                          :align="th.align"
                          :class="{
                            // [th.class]: true,
                            sortable: true,
                            sort: sortColumn === th.name,
                            'asc': sortColumn === th.name && asc,
                            'desc': sortColumn === th.name && !asc,
                          }"
                          @click="clickedHeader(th)"
                        >
                          <span v-html="th.title"></span>
                          <span class="sort-icon"></span>
                        </th>
                      </template>
                      <template v-else>
                        <th
                          v-if="th.show"
                          :key="n"
                          :align="th.align"
                          @click="clickedHeader(th)"
                          v-html="th.title"
                        ></th>
                      </template>
                    </template>
                    <!-- Render Table Headings -->

                    <!-- Actions Heading -->
                    <template v-if="actions.length">
                      <th>
                        {{ actionsHeader }}
                      </th>
                    </template>
                    <!-- Actions Heading -->
                  </tr>
                </thead>
                <!-- Table Header -->

                <!-- Table Body -->
                <template v-if="paginatedItems.length">
                  <!-- Groupable -->
                  <template v-if="groupable">
                    <template v-for="(group, n) in groups">
                      <tbody :key="n">
                        <tr>
                          <th :colspan="colspan">
                            {{ group.name }} - {{ group.items.length }} item{{ group.items.length !== 1 ? 's' : '' }}
                          </th>
                        </tr>

                        <!-- Table Rows -->
                        <template v-for="(item, n) in group.items">
                          <tr :key="n" :class="item.class">
                            <!-- Selectable Toggle -->
                            <template v-if="selectable">
                              <td>
                                <div class="custom-control custom-checkbox" @click="selectItem(item)">
                                  <input type="checkbox" class="custom-control-input" :checked="item.selected">
                                  <span class="custom-control-label"></span>
                                </div>
                              </td>
                            </template>
                            <!-- Selectable Toggle -->

                            <!-- Row Index -->
                            <template v-if="index">
                              <td>{{ reverseIndex ? renderedItems.length - (item.index) : item.index + 1 }}</td>
                            </template>
                            <!-- Row Index -->

                            <!-- Table Data -->
                            <template v-for="(td, o) in item.details">
                              <td
                                v-if="td.show"
                                :key="o"
                                :align="td.align"
                                :class="td.class"
                                @click="clickedTD(td, n)"
                              >
                                <slot :name="`td-${o+1}`" :item="item">
                                  <div v-if="td.rendered !== null && td.rendered !== ''" v-html="td.rendered"></div>
                                  <div v-else>
                                    ---
                                  </div>
                                </slot>
                              </td>
                            </template>
                            <!-- Table Data -->

                            <!-- Actions -->
                            <template v-if="actions.length">
                              <td>
                                <!-- Using Dropdown -->
                                <template v-if="canUseDropdownForActions">
                                  <div class="dropdown">
                                    <button
                                      type="button"
                                      class="dropdown btn btn-blue"
                                      data-toggle="dropdown"
                                      :disabled="!item.buttons.length || disableActions"
                                    >
                                      <!-- Actions Available -->
                                      <template v-if="item.buttons.length">
                                        Actions
                                      </template>
                                      <!-- Actions Available -->

                                      <!-- No Available Actions -->
                                      <template v-else>
                                        Unavailable
                                      </template>
                                      <!-- No Available Actions -->
                                    </button>
                                    <ul class="dropdown-menu left" data-boundary=".table-responsive">
                                      <template v-for="(action, o) in item.buttons">
                                        <a
                                          v-if="action.show"
                                          :key="o"
                                          href="javascript: void(0)"
                                          :class="action.class"
                                          :disabled="action.disabled || disableActions"
                                          @click.prevent="clickedAction(action, n)"
                                          v-html="action.text"
                                        ></a>
                                      </template>
                                    </ul>
                                  </div>
                                </template>
                                <!-- Using Dropdown -->

                                <!-- Using Button Group -->
                                <template v-else>
                                  <div class="btn-group">
                                    <template v-for="(action, o) in item.buttons">
                                      <button
                                        v-if="action.show"
                                        :key="o"
                                        :class="action.class"
                                        :disabled="action.disabled || disableActions"
                                        @click.prevent="clickedAction(action, n)"
                                        v-html="action.text"
                                      ></button>
                                    </template>
                                  </div>
                                </template>
                                <!-- Using Button Group -->
                              </td>
                            </template>
                            <!-- Actions -->
                          </tr>
                        </template>
                        <!-- Table Rows -->
                      </tbody>
                    </template>
                    <template v-for="(emptyRow, n) in missingRows">
                      <tr :key="`empty-${n}`">
                        <td :colspan="colspan"></td>
                      </tr>
                    </template>
                  </template>
                  <!-- Groupable -->

                  <!-- Not Groupable -->
                  <template v-else>
                    <tbody>
                      <!-- Table Rows -->
                      <template v-for="(item, n) in paginatedItems">
                        <tr :key="n" :class="item.class">
                          <!-- Selectable Toggle -->
                          <template v-if="selectable">
                            <td>
                              <div class="custom-control custom-checkbox" @click="selectItem(item)">
                                <input type="checkbox" class="custom-control-input" :checked="item.selected">
                                <span class="custom-control-label"></span>
                              </div>
                            </td>
                          </template>
                          <!-- Selectable Toggle -->

                          <!-- Row Index -->
                          <template v-if="index">
                            <td>{{ reverseIndex ? renderedItems.length - (item.index) : item.index + 1 }}</td>
                          </template>
                          <!-- Row Index -->

                          <!-- Table Data -->
                          <template v-for="(td, o) in item.details">
                            <td
                              v-if="td.show"
                              :key="o"
                              :align="td.align"
                              :class="td.class"
                              @click="clickedTD(td, n)"
                            >
                              <slot :name="`td-${o+1}`" :item="item">
                                <div v-if="td.rendered !== null && td.rendered !== ''" v-html="td.rendered"></div>
                                <div v-else>
                                  ---
                                </div>
                              </slot>
                            </td>
                          </template>
                          <!-- Table Data -->

                          <!-- Actions -->
                          <template v-if="actions.length">
                            <td>
                              <!-- Using Dropdown -->
                              <template v-if="canUseDropdownForActions">
                                <div class="dropdown inline-block">
                                  <button
                                    type="button"
                                    class="px-6 py-3 rounded border border-transparent focus:outline-none focus:border focus:border-blue-200"
                                    dropdown
                                    :disabled="!item.buttons.length || disableActions"
                                  >
                                    <!-- Actions Available -->
                                    <template v-if="item.buttons.length">
                                      <div class="flex flex-col">
                                        <div class="h-1 w-1 bg-gray-400 mb-1 rounded-full"></div>
                                        <div class="h-1 w-1 bg-gray-400 mb-1 rounded-full"></div>
                                        <div class="h-1 w-1 bg-gray-400 rounded-full"></div>
                                      </div>
                                    </template>
                                    <!-- Actions Available -->

                                    <!-- No Available Actions -->
                                    <template v-else>
                                      Unavailable
                                    </template>
                                    <!-- No Available Actions -->
                                  </button>
                                  <ul class="dropdown-menu left" data-boundary=".table-responsive">
                                    <template v-for="(action, o) in item.buttons">
                                      <a
                                        v-if="action.show"
                                        :key="o"
                                        href="javascript: void(0)"
                                        :class="action.class"
                                        :disabled="action.disabled || disableActions"
                                        @click.prevent="clickedAction(action, n)"
                                        v-html="action.text"
                                      ></a>
                                    </template>
                                  </ul>
                                </div>
                              </template>
                              <!-- Using Dropdown -->

                              <!-- Using Button Group -->
                              <template v-else>
                                <div class="btn-group">
                                  <template v-for="(action, o) in item.buttons">
                                    <button
                                      v-if="action.show"
                                      :key="o"
                                      :class="action.class"
                                      :disabled="action.disabled || disableActions"
                                      @click.prevent="clickedAction(action, n)"
                                      v-html="action.text"
                                    ></button>
                                  </template>
                                </div>
                              </template>
                              <!-- Using Button Group -->
                            </td>
                          </template>
                          <!-- Actions -->
                        </tr>
                      </template>
                      <template v-for="(emptyRow, n) in missingRows">
                        <tr :key="`empty-${n}`" class="empty">
                          <td :colspan="colspan"></td>
                        </tr>
                      </template>
                      <!-- Table Rows -->
                    </tbody>
                  </template>
                  <!-- Not Groupable -->
                </template>

                <template v-else>
                  <tbody>
                    <tr>
                      <td align="center" :colspan="colspan">
                        <slot name="empty">
                          No Results
                        </slot>
                      </td>
                    </tr>
                  </tbody>
                </template>

                <!-- Table Body -->
              </table>
            </div>
          </template>
          <!-- Table Content -->
        </div>
      </template>
      <!-- Datatable Body -->

      <!-- Datatable Footer -->
      <template v-if="footer">
        <slot name="footer">
          <!-- Row Four -->
          <div class="flex">
            <!-- Page Details -->
            <template v-if="pageDetails">
              <div class="w-full data-table-control mb-3 ml-3 text-sm">
                Showing {{ displayStats.start }} to {{ displayStats.end }} of {{ displayStats.total }} items.
              </div>
            </template>
            <!-- Page Details -->

            <!-- Paginatable -->
            <template v-if="paginatable && pages > 1">
              <div class="w-full data-table-control mb-3 ml-auto">
                <ul v-if="paginationLinks.length" class="pagination">
                  <li v-if="pages && currentPage !== 1" class="page-item">
                    <span class="page-link" @click="prev">Prev</span>
                  </li>
                  <li
                    v-for="item in paginationLinks"
                    :key="item.page"
                    class="page-item"
                    :class="{active: currentPage === item.page}"
                  >
                    <span class="page-link" @click="navigate(item.page)">{{ item.page }}</span>
                  </li>
                  <li v-if="pages && currentPage < pages" class="page-item">
                    <span class="page-link" @click="next">Next</span>
                  </li>
                </ul>
              </div>
            </template>
            <!-- Paginatable -->
          </div>
          <!-- Row Four -->
        </slot>
      </template>
      <!-- Datatable Footer -->
    </div>
  </div>
</template>

<script>
/*
  |-  ----------------------------------------------------------------------------------------------------
  | Dependencies
  |-  ----------------------------------------------------------------------------------------------------
  */
import axios from 'axios'
import $ from 'jquery'
import toastr from 'toastr'

export default {
  name: 'VueDataTable',

  components: {
    dateRangePicker: require('vue2-daterange-picker').default,
  },

  model: {
    prop: 'data',
    event: 'change',
  },

  props: {
    // Content
    actions: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Array,
      default: () => [],
    },
    itemProps: {
      type: Object,
      default: () => ({}),
    },
    limit: {
      type: Number,
      default: 20,
    },
    sort: {
      type: String,
      default: null,
    },
    order: {
      type: String,
      default: 'asc',
    },

    // Display Config
    actionsHeader: {
      type: String,
      default: 'Actions',
    },
    breakWords: {
      type: Boolean,
      default: true,
    },
    className: {
      type: Function,
      default: () => '',
    },
    // 'actions' for row actions
    // 'filters' for table filters
    // true for both filters and actions
    dropdown: {
      type: [Boolean, String],
      default: true,
    },
    index: {
      type: Boolean,
      default: false,
    },
    totalIndex: {
      type: Boolean,
      default: false,
    },
    reverseIndex: {
      type: Boolean,
      default: false,
    },

    // Interaction Config
    disableActions: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    useQuery: {
      type: Boolean,
      default: false,
    },
    fullTextSearch: {
      type: Boolean,
      default: false,
    },

    // Server Information
    ajax: {
      type: Boolean,
      default: false,
    },
    // ajaxHeaders: {
    //  type: Object,
    //  default: () => ({})
    // },
    ajaxPagination: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: null,
    },

    // Features
    exportable: {
      type: Boolean,
      default: false,
    },
    fillable: {
      type: Boolean,
      default: true,
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    groupable: {
      type: [Object, String],
      default: null,
    },
    limitable: {
      type: Boolean,
      default: true,
    },
    pageDetails: {
      type: Boolean,
      default: true,
    },
    paginatable: {
      type: Boolean,
      default: true,
    },
    query: {
      type: String,
      default: '',
    },
    rangeable: {
      type: [Object, String],
      default: null,
    },
    searchable: {
      type: Boolean,
      default: true,
    },
    showHeadings: {
      type: Boolean,
      default: true,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    tableStyle: {
      type: String,
      default: '',
    },

    // Sections
    footer: {
      type: Boolean,
      default: true,
    },
    header: {
      type: Boolean,
      default: true,
    },

    // Elements
    searchField: {
      type: HTMLInputElement,
      default: null,
    },
  },

  data() {
    return {
      // Content
      ajaxItems: [],
      items: [],
      headings: [],
      renderedItems: [],

      // State
      ajaxLoading: false,
      ajaxObject: null,
      asc: true,
      currentFilter: null,
      currentPage: 1,
      dateRange: {
        value: {
          startDate: null,
          endDate: null,
        },
        format: 'dd/mm/yyyy',
      },
      exportType: null,
      itemsPerPage: 20,
      lastSortColumn: null,
      searchQuery: '',
      selected: [],
      sortColumn: null,
    }
  },

  computed: {
    // Booleans
    canUseDropdownForActions() {
      return this.dropdown === true || this.dropdown === 'actions'
    },
    canUseDropdownForFilters() {
      return this.dropdown === true || this.dropdown === 'filters'
    },
    colspan() {
      return this.headings.length + (this.actions.length ? 1 : 0) + (this.index ? 1 : 0) + (this.selectable ? 1 : 0)
    },
    clickable() {
      return this.onClick !== null
    },
    displayStats() {
      return {
        end: this.paginatedItems.length ? (this.paginationEnd > this.paginatedItems.length ? this.paginatedItems.length : this.paginationEnd) : 0,
        start: this.paginatedItems.length ? this.paginationStart + 1 : 0,
        total: this.ajaxPagination && this.ajaxObject ? this.ajaxObject.total_count : this.renderedItems.length,
      }
    },
    groupableKey() {
      if (!this.groupable) return null

      switch (this.groupable.constructor) {
        case String:
          return this.groupable
        case Object:
          return this.groupable.key
        default:
          return null
      }
    },
    groupNameDeterminer() {
      return typeof this.groupable === 'object' ? this.groupable.name : null
    },
    groups() {
      const groups = []

      if (!this.groupable)
        return groups

      const groupKey = this.groupableKey
      const randomGroupName = Math.round(Math.random() * 100000)

      this.paginatedItems.forEach((item) => {
        let groupName = item.row[groupKey]
        if (!groupName)
          groupName = randomGroupName

        if (!groups.find(group => group.name === groupName)) {
          groups.push({
            name: groupName,
            items: [item],
          })
        }
        else {
          groups.forEach((group) => {
            if (group.name === groupName)
              group.items.push(item)
          })
        }
      })

      return groups.map((group) => {
        return {
          ...group,
          name: this.groupNameDeterminer ? this.groupNameDeterminer(group, group.items.map(item => item.row)) : group.name,
        }
      })
    },
    isLoading() {
      return this.loading || this.ajaxLoading
    },
    missingRows() {
      return this.fillable ? this.renderedItems.length >= 10 ? 0 : 10 - this.renderedItems.length : 0
    },
    pages() {
      if (!this.ajaxPagination) {
        if (this.renderedItems.length > this.itemsPerPage)
          return Math.ceil(this.renderedItems.length / this.itemsPerPage)

        else
          return 0
      }

      return this.ajaxObject ? this.ajaxObject.page_count : 0
    },
    paginationStart() {
      return this.itemsPerPage * (this.currentPage - 1)
    },
    paginationEnd() {
      return this.itemsPerPage * this.currentPage
    },
    paginatedItems() {
      const items = [...this.renderedItems]
      if (this.ajaxPagination)
        return items

      return items.slice(this.paginationStart, this.paginationEnd)
    },
    paginationLinks() {
      const links = []
      const center = Math.round(this.pages / 2) - 1
      for (let i = 0; i < this.pages; i++) {
        if (this.pages > 6) {
          const difference = this.currentPage - i
          // let centerDifference = center - i
          // around the current page
          if (!(difference < 0) && !(difference > 2)) {
            // around the center
          }
          else if (i === center) {
            // at the start or end
          }
          else if (this.pages - i <= 2 || i <= 1) {
            // everywhere else
          }
          else {
            continue
          }
        }
        links.push({ page: i + 1 })
      }
      return links
    },
    // Strings
    processedUrl() {
      const baseUrl = this.url.replace(/\/$/g, '')
      const url = new URL(baseUrl)
      return `${baseUrl}${url.search ? '&' : '?'}${this.queryString}`
    },
    queryString() {
      const rangeKey = this.rangeable && typeof this.rangeable === 'object' ? this.rangeable.key : this.rangeable
      let rangeStart = this.dateRange.value.startDate
      if (rangeStart) {
        const date = new Date(rangeStart)
        rangeStart = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }
      let rangeEnd = this.dateRange.value.endDate
      if (rangeEnd) {
        const date = new Date(rangeEnd)
        rangeEnd = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }

      const obj = {
        filter: this.currentFilter ? this.currentFilter.name : '',
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.query,
        order: this.asc ? 'asc' : 'desc',
        sort_column: this.sortColumn,
        fullTextSearch: this.fullTextSearch ? 1 : 0,
        rangeEnd,
        rangeKey,
        rangeStart,
        exportType: this.exportType,
      }

      const queryString = Object.keys(obj).map((key) => {
        if (obj[key])
          return `${key}=${obj[key]}`

        return null
      }).filter(key => !!key).join('&')

      return queryString
    },
  },

  watch: {
    ajaxItems() {
      this.renderData()
    },
    data() {
      this.items = this.data
    },
    items() {
      this.navigate(1)
      this.renderData()
    },
    limit(value) {
      this.itemsPerPage = value
    },
    order(order) {
      this.asc = order === 'asc'
    },
    selected() {
      this.renderData()
    },
    sort(sort) {
      this.sortColumn = sort
    },

    currentPage() {
      if (this.ajaxPagination)
        this.getData()
    },
    query() {
      this.renderData()
    },

    'dateRange.value': function() {
      if (this.ajaxPagination)
        this.getData()

      else
        this.renderData()
    },
  },

  /*
    |-  ----------------------------------------------------------------------------------------------------
    | Life Cycle Events
    |-  ----------------------------------------------------------------------------------------------------
    |
    */
  mounted() {
    this.itemsPerPage = this.limit
    this.asc = this.order === 'asc'
    this.sortColumn = this.sort
    this.init()
    this.DOMListener()
  },

  beforeDestroy() {},

  destroyed() {},
  /*
    |
    |-  ----------------------------------------------------------------------------------------------------
    */

  methods: {
    /*
      |-  ----------------------------------------------------------------------------------------------------
      | HTTP Request Methods
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    async get(url, { success }) {
      await axios({
        url,
        method: 'GET',
        headers: this.headers,
      })
        .then((response) => {
          if (!response.data)
            throw new Error('No data returned')

          success(response.data)
        })
        .catch((error) => {
          this.error(error || 'Unable to load data')
        })
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Data Loaders
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    async getData() {
      this.ajaxLoading = true

      await this.get(this.processedUrl, {
        success: (data) => {
          let items
          switch (data.constructor) {
            case Array:
              items = data
              break
            case Object:
              if (this.ajaxPagination) {
                this.ajaxObject = data.datatable
                items = this.ajaxObject.data
              }
              else {
                items = data.data
              }
              break
            default:
              throw new Error('Unknown response type')
          }
          this.ajaxItems = items
        },
      })

      this.ajaxLoading = false
    },
    loadAjaxData(reset = false) {
      if (reset)
        this.navigate(1)

      this.getData()
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Function
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    init() {
      this.renderHeaders()

      if (this.ajax)
        this.useAjax()

      else
        this.usePropsData()
    },
    renderData() {
      let items = this.ajax ? this.ajaxItems : this.data

      items = this.mapItems(items)

      if (!this.ajaxPagination) {
        // Apply Filters
        items = this.filterData(items)

        // Search Through
        items = this.searchData(items)

        // Sort Data
        items = this.sortData(items)

        // Get Desired Range
        items = this.rangeData(items)
      }

      this.renderedItems = items
    },
    renderHeaders() {
      this.headings = this.columns.map(column => ({
        align: column.align || 'left',
        name: column.name,
        show: typeof column.show === 'function' ? column.show() : column.show !== false,
        title: column.th,
        sortable: column.sortable !== undefined ? column.sortable : true,
      }))
    },
    async useAjax() {
      await this.getData()
    },
    usePropsData() {
      this.items = this.data
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Selectable
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    clearSelection() {
      this.selected = []
      this.renderedItems.forEach((item) => {
        item.selected = false
      })
      this.$refs.selectAll.checked = false
      this.$emit('selection-update', { selection: this.selected })
    },
    selectItem(item) {
      if (item.selected) {
        item.selected = false
        this.selected = this.selected.filter(i => item.index !== i.index)
        this.$refs.selectAll.checked = false

        this.$emit('deselect', { item, selection: this.selected })
      }
      else {
        item.selected = true
        this.selected.push(item)

        this.$emit('select', { item, selection: this.selected })
      }
      this.$emit('selection-update', { item, selection: this.selected })
    },
    selectItemByIndex(index) {
      const item = this.renderedItems[index]
      if (!item)
        return false

      this.selectItem(item)
    },
    selectAll(event) {
      if (event.target.checked) {
        this.renderedItems.forEach((item) => {
          item.selected = true
          this.selected = this.selected.filter(s => s.index !== item.index)
          this.selected.push(item)
        })
      }
      else {
        this.selected = []
        this.renderedItems.forEach((item) => {
          item.selected = false
        })
      }

      this.$emit('selection-update', { selection: this.selected })
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Exportable
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    exportAll() {
      this.exportType = 'all'

      // this.updateQuery()

      const url = `${this.url}?${this.queryString}`

      // window.open(url)
      axios({
        url,
        method: 'GET',
        headers: this.headers,
        responseType: 'blob',
      })
        .then((response) => {
          console.log(response)
          const downloadUrl = URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = downloadUrl
          link.setAttribute('download', 'download.xlsx')
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch((error) => {
          toastr.error(error)
        })

      this.exportType = null

      // this.updateQuery()
    },
    exportData() {
      this.exportType = 'with-filters'

      // this.updateQuery()

      const url = `${this.url}?${this.queryString}`

      // window.open(url)
      axios({
        url,
        method: 'GET',
        headers: this.headers,
        responseType: 'blob',
      })
        .then((response) => {
          console.log(response)
          const downloadUrl = URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = downloadUrl
          link.setAttribute('download', 'download.xlsx')
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch((error) => {
          toastr.error(error)
        })

      this.exportType = null

      // this.updateQuery()
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Processors
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    filterData(items) {
      const filter = this.currentFilter
      if (!filter)
        return items

      const filterValue = filter.value
      const filterColumn = filter.name

      items = items.filter((item, index) => {
        const column = item.details.find(column => column.name === filterColumn)
        // If Value Type Is A Custom Function
        if (filterValue.constructor.toString().match(/Function/)) {
          if (filterValue(item.row, column, index))
            return true
        }
        if (!column)
          return false

        if (column.value === filterValue || column.rendered === filterValue)
          return true

        return false
      })

      return items
    },
    mapItems(items) {
      items = items.map((item, index) => {
        // Row Item
        const row = {
          row: item,
          details: [],
          index,
          buttons: [],
          selected: !!this.selected.find(a => a.index === index),
        }
        row.class = this.className ? this.className(item, index, row) : ''
        // ...this.itemProps
        for (const key in this.itemProps)
          item[key] = this.itemProps[key]

        // Get Provided Columns
        this.columns.forEach((column) => {
          row.details.push({
            // Item Column Name
            name: column.name,
            // Table Header Title
            th: column.th,
            // Provided Value
            value: item[column.name],
            // Decide Value Depending On Whether Render Method Is Provided
            rendered: column.render ? column.render(item, item[column.name], index) : item[column.name],
            // Origin Item Row
            row: item,
            // Whether Or Not To Display Item
            align: column.align || 'left',
            // Whether Or Not To Display Item
            show: typeof column.show === 'function' ? column.show() : column.show !== false,
            // Click Event For Column
            click: column.click,
            // Table Cell Class
            class: typeof column.className === 'function' ? column.className() : column.className,
          })
        })

        // Get Provided Actions
        this.actions.forEach((button) => {
          let className
          if (this.canUseDropdownForActions) {
            className = 'dropdown-menu-item'
            className += ` ${button.class}`
          }
          else {
            // className = 'btn'
            className = button.class
            // className += (button.color ? ` btn-${button.color}` : '')
            // className += (button.size ? ` btn-${button.size}` : '')
          }

          row.buttons.push({
            // Spread Provided Button Properties
            ...button,
            // Decide Visibility Depending On Whether Show Method Is Provided
            // Default: true
            text: button.text,
            class: className,
            show: button.show ? button.show(item, index) : true,
            disabled: button.disabled ? button.disabled(item, index) : false,
            row,
          })
        })

        return row
      })

      return items
    },
    rangeData(items) {
      if (!this.rangeable)
        return items

      if (!this.dateRange.value.startDate || !this.dateRange.value.endDate)
        return items

      let key
      switch (this.rangeable.constructor) {
        case String:
          key = this.rangeable
          break
        case Object:
          key = this.rangeable.key
          break
      }

      const start = (new Date(this.dateRange.value.startDate)).getTime()
      const end = (new Date(this.dateRange.value.endDate)).getTime()
      items = items.filter((item) => {
        const column = item.row[key]
        if (!column)
          return false

        const date = (new Date(column)).getTime()

        return start < date && date < end
      })

      return items
    },
    searchData(items) {
      const query = this.query

      if (!query)
        return items

      items = items.filter((item) => {
        let found = false
        // Search In Mapped Data
        item.details.forEach((column) => {
          // Cancel If Original And Processed Value Are NULL
          if (!column.value || !column.rendered)
            return

          // If Found In Original Value
          if (JSON.stringify(column.value)?.match(new RegExp(query, 'i')))
            found = true

          // If Found In Processed Value
          if (JSON.stringify(column.rendered)?.match(new RegExp(query, 'i')))
            found = true
        })

        // Search In Provided Data
        for (const column in item.row) {
          if (!item.row[column])
            continue

          if (JSON.stringify(item.row[column])?.match(new RegExp(query, 'i')))
            found = true
        }

        return found
      })

      return items
    },
    sortData(items) {
      const asc = this.lastSortColumn !== this.sortColumn ? true : this.asc !== true
      const column = this.sortColumn

      if (!column)
        return items

      items = items.sort((a, b) => {
        let x, y
        if (column === '#') {
          x = a.index
        }
        else {
          const detailx = a.details.find(detail => detail.name === column)
          if (typeof detailx.value === 'number')
            x = detailx.value

          else
            x = detailx.rendered

          x = typeof x === 'string' ? x.toLowerCase() : x
        }

        if (column === '#') {
          y = b.index
        }
        else {
          const detaily = b.details.find(detail => detail.name === column)
          if (typeof detaily.value === 'number')
            y = detaily.value

          else
            y = detaily.rendered

          y = typeof y === 'string' ? y.toLowerCase() : y
        }

        return x > y ? (asc ? 1 : -1) : (asc ? -1 : 1)
      })

      this.asc = asc

      return items
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Navigation
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    navigate(page) {
      this.currentPage = page
    },
    next() {
      this.currentPage = this.currentPage >= this.pages ? 0 : this.currentPage + 1
    },
    prev() {
      this.currentPage = this.currentPage <= 0 ? this.pages : this.currentPage - 1
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Events
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    clickedAction(action, index) {
      action.action(action.row.row, index)
    },
    clickedFilter(filter) {
      if (filter === this.currentFilter) {
        this.currentFilter = null
        this.$emit('unfilter', { filter, currentFilter: this.currentFilter })
      }
      else {
        this.currentFilter = filter
        this.$emit('filter', { filter, currentFilter: this.currentFilter })
      }
      if (this.ajaxPagination)
        this.getData()

      this.$emit('filter-update', { currentFilter: this.currentFilter })
    },
    clickedHeader(th) {
      if (!th.sortable)
        return false

      this.lastSortColumn = this.sortColumn
      this.sortColumn = th.name
      this.renderData()

      if (this.ajaxPagination)
        this.getData()

      // if (this.sortColumn === lastColumn) {
      //  this.asc = !this.asc;
      // } else {
      //  this.asc = false;
      // }
    },
    clickedTD(td, index) {
      this.onClick?.apply(null, [td.row, td.value, td.name, index, td])
      td.click?.apply(null, [td.row, td.value, td.name, index, td])
      this.$emit('clicked-cell', { data: td.row, value: td.value, name: td.name, index, item: td })
      this.$emit('clicked-row', { data: td.row, value: td.value, name: td.name, index, item: td })
    },
    DOMListener() {
      $(this.$el).on('input', '.datatable-search-input', (event) => {
        this.searchQuery = event.target.value
        this.search(event)
      })

      $(this.$el).on('keyup', '.datatable-search-input', (event) => {
        if (event.which === 13)
          this.searchEnterKey()
      })

      $(this.searchField).on('keyup', (event) => {
        if (event.which === 13)
          this.searchEnterKey()
      })

      $(this.$el).on('input', '.datatable-limit-input', (event) => {
        const value = parseInt(event.target.value)
        if (isNaN(value)) return false

        this.itemsPerPage = value
      })
    },
    searchEnterKey() {
      if (this.ajaxPagination)
        this.getData()
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */

    /*
      |-  ----------------------------------------------------------------------------------------------------
      | Notifications
      |-  ----------------------------------------------------------------------------------------------------
      |
      */
    error(message = 'Data Loaded') {
      toastr.error(message)
    },
    success(message = 'An Error Occured') {
      toastr.success(message)
    },
    /*
      |
      |-  ----------------------------------------------------------------------------------------------------
      */
  },
}

</script>

  <style lang="sass">
    @keyframes spin
      from
        transform: rotate(0deg)
      to
        transform: rotate(359deg)

    .data-table
      // font-size: 14px
      &-loading
        align-items: center
        display: flex
        height: 200px
        flex-flow: column
        justify-content: center
        position: relative
        width: 100%
        &-spinner
          animation: spin 1s linear infinite
          border-radius: 999px
          border: 2px solid #007bff
          border-top-color: transparent
          content: ''
          height: 75px
          margin-bottom: 15px
          width: 75px
        &-text
          font-weight: 300
          text-trnasform: uppercase

      &-control
        .custom-select
          width: initial

      .table
        &-responsive
          min-height: 100px
          // margin-bottom: 30px
          // &::-webkit-scrollbar
          //  -webkit-apperance: none
          //  height: 15px
          //  width: 15px
          //  &-track
          //    background: #eee
          //    border-radius: 999px
          //  &-thumb
          //    background: #ccc
          //    border-radius: 999px
          //    border: 3px solid #eee
          //    &:focus
          //      background: #ccc
        &.straight
          white-space: nowrap
        thead
          th
            opacity: .5
            &.sortable
              cursor: pointer
              .sort-icon
                height: 10px
                margin-left: 5px
                // padding-right: 30px
                position: relative
                width: 4px
                &:before,
                &:after
                  border: 1.8px solid transparent
                  content: ''
                  display: block
                  left: 0
                  opacity: .3
                  position: absolute
                  // right: 10px
                &:before
                  border-bottom-color: currentColor
                  top: 0px
                  border-bottom-width: 3px
                &:after
                  bottom: 0px
                  border-top-color: currentColor
                  border-top-width: 3px
            &.sort
              font-weight: 700
              opacity: 1
              &.asc
                .sort-icon
                  &:before
                    opacity: 1
              &.desc
                .sort-icon
                  &:after
                    opacity: 1
        tbody
          tr
            &.clickable
              cursor: pointer
          td
            // font-size: 12px

        &-filters
          margin-bottom: 15px

        &-filter
          background: #fff
          border-radius: 3px
          cursor: pointer
          color: #777
          display: inline-block
          font-size: 12px
          padding: 5px 15px
          margin: 0 0 3px 3px
          &:hover
            background: #aaa
            color: #fff
          &.active
            background: #337ab7
            color: #fff

    .filter-class
      @apply border border-gray-500 cursor-pointer font-bold mb-2 mr-2 px-3 py-2 rounded-sm text-gray-500 uppercase
      font-size: 10px
      &:hover
        @apply border-blue-500 text-blue-500
      &.active
        @apply bg-blue-500 border-blue-500
        color: #fff
  </style>

  <style scoped>
    .daterangepicker.hide-calendars.show-ranges .ranges,.daterangepicker.hide-calendars.show-ranges .ranges ul{
      width:100%
    }
    .daterangepicker .calendars-container{
      display:-webkit-box;
      display:-ms-flexbox;
      display:flex
    }
    .daterangepicker {
      position:absolute;
      color:inherit;
      background-color:#fff;
      border-radius:4px;
      border:1px solid #ddd;
      width:278px;
      max-width:none;
      padding:0;
      margin-top:7px;
      top:100px;
      left:20px;
      z-index: 99999 !important;
      display:block;
      font-size:15px;
      line-height:1em
    }
    .daterangepicker:after,.daterangepicker:before{
      position:absolute;
      display:inline-block;
      border-bottom-color:rgba(0,0,0,.2);
      content:""
    }
    .daterangepicker:before{
      top:-7px;
      border-right:7px solid transparent;
      border-left:7px solid transparent;
      border-bottom:7px solid #ccc
    }
    .daterangepicker:after{
      top:-6px;
      border-right:6px solid transparent;
      border-bottom:6px solid #fff;
      border-left:6px solid transparent
    }
    .daterangepicker.opensleft:before{
      right:9px
    }
    .daterangepicker.opensleft:after{
      right:10px
    }
    .daterangepicker.openscenter:after,.daterangepicker.openscenter:before{
      left:0;
      right:0;
      width:0;
      margin-left:auto;
      margin-right:auto
    }
    .daterangepicker.opensright:before{
      left:9px
    }
    .daterangepicker.opensright:after{
      left:10px
    }
    .daterangepicker.drop-up{
      margin-top:-7px
    }
    .daterangepicker.drop-up:before{
      top:auto;
      bottom:-7px;
      border-bottom:initial;
      border-top:7px solid #ccc
    }
    .daterangepicker.drop-up:after{
      top:auto;
      bottom:-6px;
      border-bottom:initial;
      border-top:6px solid #fff
    }
    .daterangepicker.single .drp-selected{
      display:none
    }
    .daterangepicker.show-calendar .drp-buttons,.daterangepicker.show-calendar .drp-calendar{
      display:block
    }
    .daterangepicker.auto-apply .drp-buttons{
      display:none
    }
    .daterangepicker .drp-calendar{
      display:none;
      max-width:270px;
      width:270px
    }
    .daterangepicker .drp-calendar.left{
      padding:8px 0 8px 8px
    }
    .daterangepicker .drp-calendar.right{
      padding:8px
    }
    .daterangepicker .drp-calendar.single .calendar-table{
      border:none
    }
    .daterangepicker .calendar-table .next span,.daterangepicker .calendar-table .prev span{
      color:#fff;
      border:solid #000;
      border-width:0 2px 2px 0;
      border-radius:0;
      display:inline-block;
      padding:3px
    }
    .daterangepicker .calendar-table .next span{
      transform:rotate(-45deg);
      -webkit-transform:rotate(-45deg)
    }
    .daterangepicker .calendar-table .prev span{
      transform:rotate(135deg);
      -webkit-transform:rotate(135deg)
    }
    .daterangepicker .calendar-table td,.daterangepicker .calendar-table th{
      white-space:nowrap;
      text-align:center;
      vertical-align:middle;
      min-width:32px;
      width:32px;
      height:24px;
      line-height:24px;
      font-size:12px;
      border-radius:4px;
      border:1px solid transparent;
      cursor:pointer
    }
    .daterangepicker .calendar-table{
      border:1px solid #fff;
      border-radius:4px;
      background-color:#fff
    }
    .daterangepicker .calendar-table table{
      width:100%;
      margin:0;
      border-spacing:0;
      border-collapse:collapse;
      display:table
    }
    .daterangepicker td.available:hover,.daterangepicker th.available:hover{
      background-color:#eee;
      border-color:transparent;
      color:inherit
    }
    .daterangepicker td.week,.daterangepicker th.week{
      font-size:80%;
      color:#ccc
    }
    .daterangepicker td.off,.daterangepicker td.off.end-date,.daterangepicker td.off.in-range,.daterangepicker td.off.start-date{
      background-color:#fff;
      border-color:transparent;
      color:#999
    }
    .daterangepicker td.in-range{
      background-color:#ebf4f8;
      border-color:transparent;
      color:#000;
      border-radius:0
    }
    .daterangepicker td.start-date{
      border-radius:4px 0 0 4px
    }
    .daterangepicker td.end-date{
      border-radius:0 4px 4px 0
    }
    .daterangepicker td.start-date.end-date{
      border-radius:4px
    }
    .daterangepicker td.active,.daterangepicker td.active:hover{
      background-color:#357ebd;
      border-color:transparent;
      color:#fff
    }
    .daterangepicker th.month{
      width:auto
    }
    .daterangepicker option.disabled,.daterangepicker td.disabled{
      color:#999;
      cursor:not-allowed;
      text-decoration:line-through
    }
    .daterangepicker select.monthselect,.daterangepicker select.yearselect{
      font-size:12px;
      padding:1px;
      height:auto;
      margin:0;
      cursor:default
    }
    .daterangepicker select.monthselect{
      margin-right:2%;
      width:56%
    }
    .daterangepicker select.yearselect{
      width:40%
    }
    .daterangepicker select.ampmselect,.daterangepicker select.hourselect,.daterangepicker select.minuteselect,.daterangepicker select.secondselect{
      width:50px;
      margin:0 auto;
      background:#eee;
      border:1px solid #eee;
      padding:2px;
      outline:0;
      font-size:12px
    }
    .daterangepicker .calendar-time{
      text-align:center;
      margin:4px auto 0;
      line-height:30px;
      position:relative;
      display:-webkit-box;
      display:-ms-flexbox;
      display:flex
    }
    .daterangepicker .calendar-time select.disabled{
      color:#ccc;
      cursor:not-allowed
    }
    .daterangepicker .drp-buttons{
      clear:both;
      text-align:right;
      padding:8px;
      border-top:1px solid #ddd;
      display:none;
      line-height:12px;
      vertical-align:middle
    }
    .daterangepicker .drp-selected{
      display:inline-block;
      font-size:12px;
      padding-right:8px
    }
    .daterangepicker .drp-buttons .btn{
      margin-left:8px;
      font-size:12px;
      font-weight:700;
      padding:4px 8px
    }
    .daterangepicker.show-ranges .drp-calendar.left{
      border-left:1px solid #ddd
    }
    .daterangepicker .ranges{
      text-align:left;
      margin:0
    }
    .daterangepicker.show-calendar .ranges{
      margin-top:8px
    }
    .daterangepicker .ranges ul{
      list-style:none;
      margin:0 auto;
      padding:0;
      width:100%
    }
    .daterangepicker .ranges li{
      color: #000;
      font-size:12px;
      padding:8px 12px;
      cursor:pointer
    }
    .daterangepicker .ranges li:hover{
      background-color:#eee
    }
    .daterangepicker .ranges li.active{
      background-color:#08c;
      color:#fff
    }
    @media (min-width:564px){
      .daterangepicker{
        width:auto
      }
      .daterangepicker .ranges ul{
        width:140px
      }
      .daterangepicker.single .ranges ul{
        width:100%
      }
      .daterangepicker.single .drp-calendar.left{
        clear:none
      }
      .daterangepicker.ltr{
        direction:ltr;
        text-align:left
      }
      .daterangepicker.ltr .drp-calendar.left{
        clear:left;
        margin-right:0
      }
      .daterangepicker.ltr .drp-calendar.left .calendar-table{
        border-right:none;
        border-top-right-radius:0;
        border-bottom-right-radius:0
      }
      .daterangepicker.ltr .drp-calendar.right{
        margin-left:0
      }
      .daterangepicker.ltr .drp-calendar.right .calendar-table{
        border-left:none;
        border-top-left-radius:0;
        border-bottom-left-radius:0
      }
      .daterangepicker.ltr .drp-calendar.left .calendar-table{
        padding-right:8px
      }
      .daterangepicker.rtl{
        direction:rtl;
        text-align:right
      }
      .daterangepicker.rtl .drp-calendar.left{
        clear:right;
        margin-left:0
      }
      .daterangepicker.rtl .drp-calendar.left .calendar-table{
        border-left:none;
        border-top-left-radius:0;
        border-bottom-left-radius:0
      }
      .daterangepicker.rtl .drp-calendar.right{
        margin-right:0
      }
      .daterangepicker.rtl .drp-calendar.right .calendar-table{
        border-right:none;
        border-top-right-radius:0;
        border-bottom-right-radius:0
      }
      .daterangepicker.rtl .drp-calendar.left .calendar-table{
        padding-left:12px
      }
      .daterangepicker.rtl .drp-calendar,.daterangepicker.rtl .ranges{
        text-align:right
      }
    }
    @media (min-width:730px){
      .daterangepicker .ranges{
        width:auto
      }
      .daterangepicker .drp-calendar.left{
        clear:none!important
      }
    }
    .reportrange-text {
      -ms-align-items: center;
      align-items: center;
      border: 1px solid #E0E5FC;
      border-radius: 5px;
      cursor:pointer;
      display: -webkit-flex;
      display: -moz-flex;
      display: -ms-flex;
      display: -o-flex;
      display: flex;
      flex-flow: row;
      padding: 5px 30px 5px 10px;
      width:100%
    }
    .reportrange-text  > .glyphicon,
    .reportrange-text  > .fa {
      margin-right: 10px;
    }
    .reportrange-text  .caret {
      right: 10px;
      top: 25px;
      margin-left: auto;
    }
    .daterangepicker {
      -webkit-box-orient:vertical;
      -webkit-box-direction:normal;
      -ms-flex-direction:column;
      flex-direction:column;
      display:-webkit-box;
      display:-ms-flexbox;
      display:flex;
      width:auto
    }
    @media screen and (max-width:768px){
      .daterangepicker.show-ranges .drp-calendar.left {
        border-left:0
      }
      .daterangepicker.show-ranges .ranges {
        border-bottom:1px solid #ddd
      }
      .daterangepicker.show-ranges .ranges  ul{
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -ms-flex-wrap:wrap;
        flex-wrap:wrap;
        width:auto
      }
    }
    @media screen and (min-width:540px){
      .daterangepicker.show-weeknumbers ,.daterangepicker {
        min-width:486px
      }
    }
    @media screen and (min-width:768px){
      .daterangepicker.show-ranges.show-weeknumbers ,.daterangepicker.show-ranges {
        min-width:682px
      }
    }
    @media screen and (max-width:340px){
      .daterangepicker.single.show-weeknumbers ,.daterangepicker.single {
        min-width:250px
      }
    }
    @media screen and (min-width:339px){
      .daterangepicker.single {
        min-width:auto
      }
      .daterangepicker.single.show-ranges.show-weeknumbers ,.daterangepicker.single.show-ranges {
        min-width:356px
      }
      .daterangepicker.single.show-ranges .drp-calendar.left {
        border-left:1px solid #ddd
      }
      .daterangepicker.single.show-ranges .ranges {
        width:auto;
        max-width:none;
        -ms-flex-preferred-size:auto;
        flex-basis:auto;
        border-bottom:0
      }
      .daterangepicker.single.show-ranges .ranges  ul{
        display:block;
        width:100%
      }
    }
    .daterangepicker.show-calendar {
      display:block
    }
    .daterangepicker.opensleft {
      top:35px;
      right:10px;
      left:auto
    }
    .daterangepicker.openscenter {
      top:35px;
      right:auto;
      left:50%;
      -webkit-transform:translate(-50%);
      transform:translate(-50%)
    }
    .daterangepicker.opensright {
      top:35px;
      left:10px;
      right:auto
    }
    .slide-fade-enter-active {
      -webkit-transition:all .2s ease;
      transition:all .2s ease
    }
    .slide-fade-leave-active {
      -webkit-transition:all .1s cubic-bezier(1,.5,.8,1);
      transition:all .1s cubic-bezier(1,.5,.8,1)
    }
    .slide-fade-enter ,.slide-fade-leave-to {
      -webkit-transform:translateX(10px);
      transform:translateX(10px);
      opacity:0
    }
    .vue-daterange-picker {
      position:relative;
      display:inline-block;
      min-width:60px;
      width: 25%
    }
    .vue-daterange-picker .dropdown-menu {
      padding:0
    }
    .vue-daterange-picker .show-ranges.hide-calendars {
      width:150px;
      min-width:150px
    }
    .dropdown-menu.opensleft,
    .dropdown-menu.openscenter,
    .dropdown-menu.opensright {
      opacity: 1;
      visibility: visible;
    }
    .calendars.row.no-gutters {
      display: flex !important;
    }
  </style>
