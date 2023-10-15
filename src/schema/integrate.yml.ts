// language=yaml
export const integrateYmlSchema = `
type: object
required:
  - tasks
properties:
  env:
    type: object
  preInfo:
    oneOf:
      - type: string
      - type: object
        required:
          - message
        properties:
          title:
            type: string
          message:
            type: string
  postInfo:
    oneOf:
      - type: string
      - type: object
        required:
          - message
        properties:
          title:
            type: string
          message:
            type: string
  dependencies:
    type: array
    items:
      type: string
  tasks:
    type: array
    items:
      type: object
      required:
        - type
      properties:
        name:
          type: string
        label:
          type: string
        when:
          type: object
        preInfo:
          oneOf:
            - type: string
            - type: object
              required:
                - message
              properties:
                title:
                  type: string
                message:
                  type: string
        postInfo:
          oneOf:
            - type: string
            - type: object
              required:
                - message
              properties:
                title:
                  type: string
                message:
                  type: string

      anyOf:
        # prompt task
        - properties:
            type:
              type: string
              enum: [prompt]
            actions:
              type: array
              items:
                type: object
                oneOf:
                  # text prompt
                  - required:
                      - name
                      - text
                    additionalProperties: false
                    properties:
                      name:
                        type: string
                      when:
                        type: object
                      text:
                        type: string
                      defaultValue:
                        type: string
                      initialValue:
                        type: string
                      placeholder:
                        type: string
                      validate:
                        oneOf:
                          - type: object
                            required:
                              - regex
                              - message
                            properties:
                              regex:
                                type: string
                              flags:
                                type: string
                              message:
                                type: string
                          - type: array
                            items:
                              type: object
                              required:
                                - regex
                                - message
                              properties:
                                regex:
                                  type: string
                                flags:
                                  type: string
                                message:
                                  type: string

                  # confirm prompt
                  - required:
                      - name
                      - text
                      - type
                    properties:
                      name:
                        type: string
                      when:
                        type: object
                      text:
                        type: string
                      type:
                        type: string
                        enum: [ boolean ]
                      initialValue:
                        type: string
                      positive:
                        type: string
                      negative:
                        type: string

                  # multiselect prompt
                  - required:
                      - name
                      - text
                      - type
                    properties:
                      name:
                        type: string
                      when:
                        type: object
                      text:
                        type: string
                      type:
                        type: string
                        enum: [ multiselect ]
                      required:
                        type: boolean
                      options:
                        type: array
                        items:
                          type: object
                          required:
                            - value
                          properties:
                            label:
                              type: string
                            hint:
                              type: string
                            value:
                              oneOf:
                                - type: string
                                - type: boolean
                                - type: number
                      initialValues:
                        type: array
                        items:
                          oneOf:
                            - type: string
                            - type: boolean
                            - type: number

        # plist task
        - properties:
            type:
              type: string
              enum: [plist]
            target:
              type: string
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  set:
                    type: object
                  strategy:
                    type: string
                    enum: [merge_concat, merge, append, assign]

        # json task
        - required:
            - path
          properties:
            type:
              type: string
              enum: [json]
            path:
              type: string
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  set:
                    type: object
                  strategy:
                    type: string
                    enum: [merge_concat, merge, append, assign]

        # app_delegate task
        - properties:
            type:
              type: string
              enum: [app_delegate]
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  block:
                    type: string
                    enum: [didFinishLaunchingWithOptions, applicationDidBecomeActive, applicationWillResignActive, applicationDidEnterBackground, applicationWillEnterForeground, applicationWillTerminate, openURL, restorationHandler, didRegisterForRemoteNotificationsWithDeviceToken, didFailToRegisterForRemoteNotificationsWithError, didReceiveRemoteNotification, fetchCompletionHandler]
                  prepend:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  append:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  replace:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  before:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  after:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  search:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  strict:
                    type: boolean
                  ifNotPresent:
                    type: string
                  comment:
                    type: string
                  exact:
                    type: boolean

        # validate task
        #        - properties:
        #            type:
        #              type: string
        #              enum: [validate]
        #            label:
        #              type: string
        #            file:
        #              anyOf:
        #                - type: string
        #                - type: object
        #                  properties:
        #                    regex:
        #                      type: string
        #                    flags:
        #                      type: string
        #            find:
        #              anyOf:
        #                - type: string
        #                - type: object
        #                  properties:
        #                    regex:
        #                      type: string
        #                    flags:
        #                      type: string
        #            errorMsg:
        #              type: string

        # build gradle task
        - properties:
            type:
              type: string
              enum: [build_gradle]
            location:
              type: string
              enum: [root, app]
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  block:
                    type: string
                  prepend:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  append:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  replace:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  before:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  after:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  search:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  strict:
                    type: boolean
                  ifNotPresent:
                    type: string
                  comment:
                    type: string
                  exact:
                    type: boolean

        # android manifest task
        - properties:
            type:
              type: string
              enum: [android_manifest]
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  block:
                    type: string
                    enum: [manifest, application, activity]
                  prepend:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  append:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  replace:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  before:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  after:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  search:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  strict:
                    type: boolean
                  ifNotPresent:
                    type: string
                  comment:
                    type: string
                  exact:
                    type: boolean
                  attributes:
                    type: object

        # xcode task
        - properties:
            type:
              type: string
              enum: [xcode]
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                anyOf:
                  - required:
                      - addFile
                    properties:
                      addFile:
                        type: string
                      message:
                        type: string
                      target:
                        anyOf:
                          - type: string
                            enum: [root, app]
                          - type: object
                            properties:
                              name:
                                type: string
                              path:
                                type: string
                  - required:
                      - addTarget
                    properties:
                      addTarget:
                        type: string
                      type:
                        type: string
                        enum: [notification-service, notification-content]

        # podfile task
        - properties:
            type:
              type: string
              enum: [podfile]
            actions:
              type: array
              items:
                type: object
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  block:
                    type: string
                  prepend:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  append:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  replace:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          file:
                            type: string
                  before:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  after:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  search:
                    anyOf:
                      - type: string
                      - type: object
                        properties:
                          regex:
                            type: string
                          flags:
                            type: string
                  strict:
                    type: boolean
                  ifNotPresent:
                    type: string
                  comment:
                    type: string
                  exact:
                    type: boolean

        # fs task
        - properties:
            type:
              type: string
              enum: [fs]
            actions:
              type: array
              items:
                type: object
                required:
                  - destination
                properties:
                  name:
                    type: string
                  when:
                    type: object
                  destination:
                    type: string
                  message:
                    type: string
                oneOf:
                  - properties:
                      copyFile:
                        type: string
`;
