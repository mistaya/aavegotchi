<template>
    <details>
      <summary>
        <label>
          <input
            type="checkbox"
            :checked="allChildrenChecked"
            @change="toggleAll($event.target.checked)"
          >
          {{ parentLabel }}
        </label>
      </summary>
      <div style="margin-left: 30px">
        <div
          v-for="child in children"
          :key="child.id"
        >
          <label>
            <input
              type="checkbox"
              :checked="modelValue.includes(child.id)"
              @change="onChildChange(child.id, $event.target.checked)"
            />
            {{ child.label }}
          </label>
        </div>
      </div>
    </details>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    // modelValue is an Array of selections, which may include external selections not in this group
    modelValue: { type: Array, required: true },
    children: { type: Array, required: true },
    parentLabel: { type: String, required: true }
  },
  setup (props, { emit }) {
    const childIds = computed(() => props.children.map(child => child.id))
    const allChildrenChecked = computed(() => props.modelValue.length > 0 && childIds.value.every(id => props.modelValue.includes(id)))

    const toggleAll = function (checked) {
      if (checked) {
        emit('update:modelValue', [...new Set([...props.modelValue, ...childIds.value])])
      } else {
        emit('update:modelValue', props.modelValue.filter(id => !childIds.value.includes(id)))
      }
    }

    const onChildChange = function (childId, checked) {
      if (checked) {
        if (!props.modelValue.includes(childId)) {
          emit('update:modelValue', [...props.modelValue, childId])
        }
      } else {
        if (props.modelValue.includes(childId)) {
          emit('update:modelValue', props.modelValue.filter(id => id !== childId))
        }
      }
    }

    return {
      toggleAll,
      allChildrenChecked,
      onChildChange
    }
  }
}
</script>

<style scoped>
  summary::marker {
    color: var(--site-border-color--transparent);
  }
</style>
