<template>
  <div
    v-if="numFilteredLands === 0"
    style="margin-top: 20px;"
  >
    No lands found.
  </div>
  <SiteTable
    v-else
    :page="page"
    :pageSize="pageSize"
    itemsLabel="lands"
    :numResults="numFilteredLands"
    :scrollingBreakpoint="1200"
    @update:page="$emit('update:page', $event)"
    @update:pageSize="$emit('update:pageSize', $event)"
  >
    <template #headers>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>
          District
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'district' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'district' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th>
          Size
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'size' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'size' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th>
          Aaltar
          <SortToggle
            defaultDirection="desc"
            :sort="sortColumn === 'aaltar level' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'aaltar level' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th style="min-width: 100px;">
          Aaltar ready
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'cooldownTimestamp' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'cooldownTimestamp' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th>
          Channeling Access
        </th>
        <th>Cooldown</th>
        <th style="min-width: 100px;">
          Aaltar last used
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'lastChanneledTimestamp' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'lastChanneledTimestamp' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th>
          Reservoir Access
        </th>
        <th style="min-width: 100px;">
          Reservoirs last emptied
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'lastClaimedTimestamp' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'lastClaimedTimestamp' : null); $emit('update:sortDirection', $event)"
          />
        </th>
        <th style="min-width: 100px;">
          Reservoirs ready
          <SortToggle
            defaultDirection="asc"
            :sort="sortColumn === 'reservoirCooldownTimestamp' ? sortDirection : null"
            @update:sort="$emit('update:sortColumn', $event ? 'reservoirCooldownTimestamp' : null); $emit('update:sortDirection', $event)"
          />
        </th>
      </tr>
    </template>
    <template #rows>
      <tr
        v-for="row in rowsToDisplay"
        :key="row.id"
      >
        <td>
          <router-link
            :to="{ name: 'parcel', params: { parcelId: row.id } }"
            target="_blank"
            title="show parcel details in new tab"
          >
            #{{ row.id }}
            <SiteIcon name="open-window" :size="13" />
            <span class="sr-only">
              Open details in new tab
            </span>
          </router-link>
        </td>
        <td>
          {{ row.parcelHash }}
          <CopyToClipboard
            :text="row.parcelHash"
            label="copy name"
          />
        </td>
        <td>
          {{ row.district }}
        </td>
        <td>
          {{ row.sizeLabel }}
        </td>
        <td>
          <template v-if="row.aaltar">
            {{ row.aaltar.label }}
          </template>
          <!--
            {{ row.equippedInstallations }}
          -->
        </td>
        <td>
          <template v-if="row.cooldownTimestamp < tickerTimestamp">
            Now
          </template>
          <DateFriendly
            v-else-if="row.cooldownDate"
            :date="row.cooldownDate"
            enableToggle
          />
        </td>
        <td>
          <template v-if="row.accessRights.channeling.accessRight === 0">
            Owner
          </template>
          <template v-else-if="row.accessRights.channeling.accessRight === 1">
            Borrower
          </template>
          <template v-else-if="row.accessRights.channeling.accessRight === 2">
            Whitelist ({{ row.accessRights.channeling.whitelistId }})
          </template>
          <template v-else-if="row.accessRights.channeling.accessRight === 4">
            Anyone
          </template>
        </td>
        <td>
          <template v-if="row.aaltar">
            {{ row.aaltar.cooldownHours }}h
          </template>
        </td>
        <td>
          <DateFriendly
            v-if="row.lastChanneledDate"
            :date="row.lastChanneledDate"
            enableToggle
          />
          <template v-else-if="row.lastChanneledTimestamp === 0">
            Never used
          </template>
        </td>
        <td>
          <template v-if="row.accessRights.reservoir.accessRight === 0">
            Owner
          </template>
          <template v-else-if="row.accessRights.reservoir.accessRight === 1">
            Borrower
          </template>
          <template v-else-if="row.accessRights.reservoir.accessRight === 2">
            Whitelist ({{ row.accessRights.reservoir.whitelistId }})
          </template>
          <template v-else-if="row.accessRights.reservoir.accessRight === 4">
            Anyone
          </template>
        </td>
        <td>
          <DateFriendly
            v-if="row.lastClaimedDate"
            :date="row.lastClaimedDate"
            enableToggle
          />
          <template v-else-if="row.lastClaimedDate === 0">
            Never
          </template>
        </td>
        <td>
          <template v-if="row.reservoirCooldownTimestamp < tickerTimestamp">
            Now
          </template>
          <DateFriendly
            v-else-if="row.reservoirCooldownDate"
            :date="row.reservoirCooldownDate"
            enableToggle
          />
        </td>
      </tr>
    </template>
  </SiteTable>
</template>

<script>
import CopyToClipboard from '@/common/CopyToClipboard.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'

export default {
  components: {
    CopyToClipboard,
    DateFriendly,
    SiteTable,
    SortToggle
  },
  props: {
    page: { type: Number, default: 0 },
    pageSize: { type: Number, default: 25 },
    sortColumn: { type: String, default: 'cooldownTimestamp' },
    sortDirection: { type: String, default: 'asc' },
    numFilteredLands: { type: Number, default: 0 },
    rowsToDisplay: { type: Array, default: () => [] },
    tickerTimestamp: { type: Number, default: 0 }
  },
  setup (props) {
    return {
    }
  }
}
</script>

<style scoped>
</style>
