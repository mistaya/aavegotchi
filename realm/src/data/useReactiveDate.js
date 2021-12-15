import { ref } from 'vue'

const tickerDate = ref(new Date())

// This date object is updated every 15 seconds
// So it's not an accurate 'now', but will change frequently enough
// that it can be used as a reactive trigger for relative date displays
setInterval(() => { tickerDate.value = new Date() }, 15_000)

export default function () {
  return {
    tickerDate
  }
}
