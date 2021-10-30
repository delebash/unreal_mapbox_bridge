<template>
  <router-view/>
</template>
<script>
window.installEvent = ''
import {defineComponent} from 'vue';

export default defineComponent({
      name: 'App',
      setup() {
        return {
          data_path: '',
        }
      },
      mounted() {
        //PWA Custom Button
        window.addEventListener('beforeinstallprompt', async function (e) {
          e.preventDefault();
          window.installEvent = e
        });
      }
    },
)
</script>
