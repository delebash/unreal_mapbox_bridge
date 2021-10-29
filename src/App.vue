<template>
  <router-view/>
</template>
<script>
window.installEvent = ''
import {defineComponent} from 'vue';
import idbKeyval from './utilities/fileUtils/idb-keyval-iife'

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
          // Prevent the mini-infobar from appearing on mobile
          e.preventDefault();
          window.installEvent = e
        });
      }
    },
)
</script>
