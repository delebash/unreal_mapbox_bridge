"use strict";var Module={},initializedJS=!1;function threadPrintErr(){var e=Array.prototype.slice.call(arguments).join(" ");console.error(e)}function threadAlert(){var e=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:e,threadId:Module._pthread_self()})}var err=threadPrintErr;self.alert=threadAlert,Module.instantiateWasm=function(e,t){var a=new WebAssembly.Instance(Module.wasmModule,e);return t(a),Module.wasmModule=null,a.exports},self.onmessage=function(e){try{if("load"===e.data.cmd){if(Module.wasmModule=e.data.wasmModule,Module.wasmMemory=e.data.wasmMemory,Module.buffer=Module.wasmMemory.buffer,Module.ENVIRONMENT_IS_PTHREAD=!0,"string"==typeof e.data.urlOrBlob)importScripts(e.data.urlOrBlob);else{var t=URL.createObjectURL(e.data.urlOrBlob);importScripts(t),URL.revokeObjectURL(t)}Vips(Module).then((function(e){Module=e}))}else if("run"===e.data.cmd){Module.__performance_now_clock_drift=performance.now()-e.data.time,Module.__emscripten_thread_init(e.data.threadInfoStruct,0,0);var a=e.data.stackBase,r=e.data.stackBase+e.data.stackSize;Module.establishStackSpace(r,a),Module.PThread.receiveObjectTransfer(e.data),Module.PThread.threadInit(),initializedJS||(Module.___embind_register_native_and_builtin_types(),initializedJS=!0);try{var d=Module.invokeEntryPoint(e.data.start_routine,e.data.arg);Module.keepRuntimeAlive()?Module.PThread.setExitStatus(d):Module.__emscripten_thread_exit(d)}catch(e){if("unwind"!=e){if(!(e instanceof Module.ExitStatus))throw Module.__emscripten_thread_exit(-2),e;Module.keepRuntimeAlive()||Module.__emscripten_thread_exit(e.status)}}}else"cancel"===e.data.cmd?(Module._pthread_self()&&Module.__emscripten_thread_exit(-1),postMessage({cmd:"cancelDone"})):"setimmediate"===e.data.target||("processThreadQueue"===e.data.cmd?Module._pthread_self()&&Module._emscripten_current_thread_process_queued_calls():(err("worker.js received unknown command "+e.data.cmd),err(e.data)))}catch(e){throw err("worker.js onmessage() captured an uncaught exception: "+e),e&&e.stack&&err(e.stack),e}};