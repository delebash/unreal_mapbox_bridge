<template>
  <q-dialog class="dialog-plugin" ref="dialog" @hide="onDialogHide">
    <q-card style="width:600px;height:600px">
      <q-card-section class="row items-center no-wrap" style="height:50px">
        <div>
          <div class="text-weight-bold">Help Section</div>
        </div>
        <q-space></q-space>
        <q-btn flat round icon="close" v-close-popup></q-btn>
      </q-card-section>
      <q-separator></q-separator>
      <div class="">TODO:</div>
      <q-card-actions class="absolute-bottom" align="right">
        <q-btn color="primary" label="OK" @click="onOKClick"/>
        <q-btn color="primary" label="Cancel" @click="onCancelClick"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    // ...your custom props
  },

  emits: [
    // REQUIRED
    'ok', 'hide'
  ],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick() {
      // we just need to hide the dialog
      this.hide()
    }
  }
}
</script>
