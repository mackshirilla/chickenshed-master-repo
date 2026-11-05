task registration_staff_queue {
 description = "Validate staff order edits and deliver explicitly requested confirmations; no charges."
 stack {function.run registration_staff_process_queue_v1 {input={send:true}} as $processed}
 schedule = [{starts_on: 2026-11-05 00:00:00+0000, freq: 60}]
 history = false
}
