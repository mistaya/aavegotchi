<template>
  <div v-if="!hasWeb3">
    Please enable Metamask and reload the page
  </div>
  <div v-else-if="chainStatus.error">
    Error finding chain ({{ chainStatus.errorMessage }})
  </div>
  <div v-else-if="chainStatus.loading">
    Connecting...
  </div>
  <router-view v-else-if="isPolygon" />
</template>

<script>
import { ref } from "vue";
import useStatus from "@/data/useStatus";

export default {
  name: 'App',
  setup () {
    const hasWeb3 = typeof window.ethereum !== 'undefined';
    const isPolygon = ref(false);
    const { status: chainStatus, setLoading: setChainLoading } = useStatus();

    if (hasWeb3) {
      window.ethereum.on('chainChanged', () => window.location.reload());

      const [isStale, setLoaded, setError] = setChainLoading();
      window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
        if (isStale()) { return; }
        // Polygon is 137 = 0x89 in hex
        if (chainId !== "0x89") {
          setError("Please connect to the Polygon network.");
        } else {
          isPolygon.value = true;
          setLoaded(true);
        }
      }).catch(err => {
        if (isStale()) { return; }
        console.error("Error checking chain", err);
        setError(err.message);
      });
    }

    return {
      hasWeb3,
      chainStatus,
      isPolygon
    };
  }
}
</script>

<style>
  body {
    margin: 0;
    padding: 0;
  }
</style>

<style scoped>
  div {
    margin: 30px;
  }
</style>