<template>
  <div>
    <template v-if="$route.name === 'lending-lands'">
      <div style="margin-bottom: 10px;">
        <h2 style="display: inline; margin-right: 15px;">
          Find Lands
        </h2>
      </div>
      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterOwnerAddress"
      >
        <label>
          Address that owns lands:
          <input
            v-model="inputOwnerAddress"
            type="text"
          />
        </label>
        <SiteButton
          type="submit"
          :disabled="!inputOwnerAddress"
        >
          Use this address
        </SiteButton>
      </form>

      <div style="margin: 15px 0 15px 40px">
        -- OR --
      </div>

      <router-link
        :to="{ name: 'lending-lands-public' }"
      >
        Lands that allow anyone to channel or empty reservoirs
      </router-link>
    </template>
    <router-view v-else></router-view>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const redirectOldRoute = function (to, next) {
  // redirect old path /lending/lands?address=OWNER_ADDRESS
  if (to.query?.address) {
    next({
      name: 'lending-lands-owner',
      params: {
        address: to.query.address
      }
    })
    next()
  } else {
    next()
  }
}

export default {
  beforeRouteEnter (to, from, next) {
    redirectOldRoute(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    redirectOldRoute(to, next)
  },
  setup (props) {
    const router = useRouter()

    const inputOwnerAddress = ref('')

    const enterOwnerAddress = () => {
      router.push({
        name: 'lending-lands-owner',
        params: {
          address: inputOwnerAddress.value
        }
      })
    }

    return {
      inputOwnerAddress,
      enterOwnerAddress
    }
  }
}
</script>

<style scoped>
</style>
