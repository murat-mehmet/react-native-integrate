export const mockIntegrateYml = `tasks:
  - type: app_delegate
    imports:
      - <Firebase.h>
    method: didFinishLaunchingWithOptions
    prepend: "[FIRApp configure];"`;