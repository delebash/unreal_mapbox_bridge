import { Quasar, Notify, Dialog } from "quasar";
import './css/app.scss'

import createRouter from './router'
const router = createRouter()

export function initQuasar(app) {
  app.use(Quasar, {
    config: {
      // brand: {
      //   primary: "#F26338",
      //   sunshine: "#FEBE2A",
      //   whiteField: "#E2E1E1",
      //   darkBG: "#1D2F37"
      // },
      globalProperties: {},
      // dark: true
    },
    plugins: {
      Notify,
      Dialog
    }
  });
  app.use(router)
}
