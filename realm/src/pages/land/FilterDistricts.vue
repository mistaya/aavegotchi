<template>
  <details class="filter-container">
    <summary>
      <h4>Filter by District</h4>
    </summary>

    <div style="margin-bottom: 8px">
      <div
        v-for="option in [{ id: 'single', label: 'Single District' }, { id: 'multiple', label: 'Multiple Districts' }]"
        :key="option.id"
      >
        <label>
          <input
            :checked="modelValue.selectionMode === option.id"
            type="radio"
            name="filterDistrictsSelectionMode"
            :value="option.id"
            @change="selectionModeChanged(option.id)"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div
      v-if="modelValue.selectionMode === 'single'"
      style="margin-left: 25px;"
    >
      <label>
        District:
        <select
          :value="modelValue.selectSingle"
          @change="selectSingleChanged($event.target.value)"
        >
          <option
            v-for="district in districts"
            :key="district"
            :value="district"
          >
            {{ district }}
          </option>
        </select>
      </label>
    </div>

    <div
      v-if="modelValue.selectionMode === 'multiple'"
      style="margin-left: 20px;"
    >
      <span
        v-for="district in districts"
        :key="district"
        class="district-entry"
      >
        <label>
          <input
            v-model="mySelectMultiple"
            type="checkbox"
            :value="district"
            @change="selectMultipleChanged(mySelectMultiple)"
          />
            {{ district }}
        </label>
      </span>

      <div>
        <SiteButton
          type="button"
          class="district-select-shortcut"
          @click="selectMultipleChanged(districts)"
        >
          Select all
        </SiteButton>

        <SiteButton
          type="button"
          class="district-select-shortcut"
          @click="selectMultipleChanged([])"
        >
          Select none
        </SiteButton>
      </div>
    </div>
  </details>
</template>

<script>

const DISTRICTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43']

const getDefaultValue = function (districts) {
  return {
    selectionMode: 'multiple', // or 'single'
    selectSingle: districts[0],
    selectMultiple: [...districts]
  }
}
const getFilter = function (districts, { selectionMode, selectSingle, selectMultiple }) {
  if (selectionMode === 'single') {
    return parcel => parcel.district === selectSingle
  }
  const districtsToExclude = districts.filter(district => !selectMultiple.includes(district))
  return parcel => !(districtsToExclude.includes(parcel.district))
}
export { DISTRICTS, getFilter, getDefaultValue }

export default {
  props: {
    districts: { type: Array, default: () => [...DISTRICTS] },
    modelValue: { type: Object, default: () => getDefaultValue(DISTRICTS) }
  },
  // make a local copy of selectMultiple so we can use Vue's smart v-model handling of arrays
  data () {
    return {
      mySelectMultiple: []
    }
  },
  computed: {
    DISTRICTS () {
      return DISTRICTS
    }
  },
  watch: {
    'modelValue.selectMultiple': {
      immediate: true,
      handler (newVal, oldVal) {
        this.mySelectMultiple = [...this.modelValue.selectMultiple]
      }
    }
  },
  methods: {
    selectionModeChanged (selectionMode) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        selectionMode
      })
    },
    selectSingleChanged (selectSingle) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        selectSingle
      })
    },
    selectMultipleChanged (selectMultiple) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        selectMultiple: [...selectMultiple]
      })
    }
  }
}
</script>

<style scoped>
  .district-entry {
    display: inline-block;
    margin-right: 15px;
    white-space: nowrap;
  }
  .district-select-shortcut {
    margin-top: 10px;
    margin-right: 10px;
  }
</style>
