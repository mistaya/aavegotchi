<template>
  <div>
    <h1>Gotchi channeling activity (temporary page)</h1>
    <div>
      <form
        style="margin-bottom: 10px;"
        @submit.prevent="submit"
      >
        <label>
          Gotchi ID:
          <input v-model="gotchiId" />
        </label>
        <SiteButton
          type="submit"
          style="margin-left: 10px;"
        >
          Find last channeled
        </SiteButton>
      </form>
      <div v-if="status.loading">
        Loading...
      </div>
      <div v-if="status.error">
        Error fetching status
      </div>
      <div v-if="status.loaded">
        <template v-if="!lastChanneled">
          Couldn't find a last-channeled date for gotchi {{ gotchiIdFetched }}
        </template>
        <template v-else>
          Gotchi {{ gotchiIdFetched }} last channeled: <DatePrecise :date="lastChanneled" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import useRealmContract from '@/data/useRealmContract'
import useStatus from '@/data/useStatus'
import DatePrecise from './DatePrecise.vue'

export default {
  components: {
    DatePrecise
  },
  setup () {
    const { getLastChanneled } = useRealmContract()
    const { status, setLoading, reset } = useStatus()
    const gotchiId = ref('')
    const gotchiIdFetched = ref('')
    const lastChanneled = ref(null)

    const submit = function () {
      if (!gotchiId.value) {
        reset()
        return
      }
      const [isStale, setLoaded, setError] = setLoading()
      gotchiIdFetched.value = gotchiId.value
      getLastChanneled(gotchiId.value).then(
        result => {
          if (isStale()) { return }
          lastChanneled.value = result ? new Date(result * 1000) : null
          setLoaded()
        },
        error => {
          if (isStale()) { return }
          console.error(error)
          setError(error.message)
        }
      )
    }

    return {
      gotchiId,
      submit,
      gotchiIdFetched,
      status,
      lastChanneled
    }
  }
}
</script>

<style scoped>
</style>
