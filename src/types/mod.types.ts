import {
  ConfirmPromptArgs,
  MultiselectPromptArgs,
  TextPromptArgs,
} from './prompt.types';

export type TextOrFileValue =
  | string
  | {
      file: string;
    };

export type TextOrRegex = string | { regex: string; flags?: string };

export type TextOrTitleMessage =
  | string
  | {
      title: string;
      message: string;
    };

export type ContentModifierType<TBlock = string> = ActionBase & {
  // adds comment with code
  comment?: string;

  // block to insert
  block?: TBlock;

  // inserts if text is not present
  ifNotPresent?: string;

  // specifies that before, after, append and prepend
  // should insert text without line management
  exact?: boolean;

  // narrows context to after this point
  after?: TextOrRegex;

  // narrows context to before this point
  before?: TextOrRegex;

  // narrows context to this point
  search?: TextOrRegex;

  // throws if before or after fails to find insertion point
  strict?: boolean;

  // appends text to the end of file context
  append?: TextOrFileValue;

  // appends text to the start of file context
  prepend?: TextOrFileValue;

  // replaces the file context with text
  replace?: TextOrFileValue;
};

export type ObjectModifierType = ActionBase & {
  set: {
    [key: string]: any;
  };
  strategy?: 'merge_concat' | 'merge' | 'append' | 'assign';
};

export type ActionBase = {
  name?: string;
  when?: any;
};

export type ActionsType<T extends ActionBase> = {
  actions: T[];
};

// plist task

export type PlistTaskType = ModTaskBase &
  ActionsType<ObjectModifierType> & {
    type: 'plist';
    target?: string;
  };

// json task

export type JsonTaskType = ModTaskBase &
  ActionsType<ObjectModifierType> & {
    type: 'json';
    path: string;
  };

// app_delegate task

export type AppDelegateTaskType = ModTaskBase &
  ActionsType<ContentModifierType<AppDelegateBlockType>> & {
    type: 'app_delegate';
  };
export type AppDelegateBlockType =
  | 'didFinishLaunchingWithOptions'
  | 'applicationDidBecomeActive'
  | 'applicationWillResignActive'
  | 'applicationDidEnterBackground'
  | 'applicationWillEnterForeground'
  | 'applicationWillTerminate'
  | 'openURL'
  | 'restorationHandler'
  | 'didRegisterForRemoteNotificationsWithDeviceToken'
  | 'didFailToRegisterForRemoteNotificationsWithError'
  | 'didReceiveRemoteNotification'
  | 'fetchCompletionHandler';

// validation task

// export type ValidationTaskType = ModTaskBase & {
//   type: 'validate';
//   file: string | { regex: string; flags?: string };
//   find?: string | { regex: string; flags?: string };
//   errorMsg?: string;
// };

// build gradle task

export type BuildGradleTaskType = ModTaskBase &
  ActionsType<ContentModifierType> & {
    type: 'build_gradle';
    location?: BuildGradleLocationType;
  };

export type BuildGradleLocationType = 'root' | 'app';

// android manifest task

export type AndroidManifestTaskType = ModTaskBase &
  ActionsType<AndroidManifestModifierType> & {
    type: 'android_manifest';
  };

export type AndroidManifestBlockType = 'manifest' | 'application' | 'activity';

export type AndroidManifestModifierType =
  ContentModifierType<AndroidManifestBlockType> & {
    attributes?: Record<string, any>;
  };

// add resource task

export type XcodeTaskType = ModTaskBase &
  ActionsType<XcodeModifierType> & {
    type: 'xcode';
  };

export type XcodeAddFile = ActionBase & {
  addFile: string;
  message?: string;
  target?:
    | 'root'
    | 'app'
    | {
        name?: string;
        path?: string;
      };
};
export type XcodeAddTarget = ActionBase & {
  addTarget: string;
  type: XcodeAddTargetType;
  message?: string;
};

export type XcodeAddTargetType =
  | 'notification-service'
  | 'notification-content';
export type XcodeModifierType = XcodeAddFile | XcodeAddTarget;

// pod file task

export type PodFileTaskType = ModTaskBase &
  ActionsType<ContentModifierType> & {
    type: 'podfile';
  };

// fs task

export type FsTaskType = ModTaskBase &
  ActionsType<FsModifierType> & {
    type: 'fs';
  };

export type FsModifierType = ActionBase & {
  copyFile?: string;
  message?: string;
  destination: string;
};

// prompt task

export type PromptTaskType = ModTaskBase &
  ActionsType<PromptActionType> & {
    type: 'prompt';
  };

export type PromptActionType = ActionBase & Prompt;

export type ModTaskBase = {
  name?: string;
  label?: string;
  when?: any;
  preInfo?: TextOrTitleMessage;
  postInfo?: TextOrTitleMessage;
};

export type ModTask =
  | PlistTaskType
  | AppDelegateTaskType
  | BuildGradleTaskType
  | AndroidManifestTaskType
  | XcodeTaskType
  | PodFileTaskType
  | FsTaskType
  | JsonTaskType
  | PromptTaskType;

export type ValidationType = { regex: string; flags?: string; message: string };
export type TextPrompt = Omit<TextPromptArgs, 'validate'> & {
  type: undefined;
  validate?: ValidationType | ValidationType[];
};
export type ConfirmPrompt = ConfirmPromptArgs & {
  type: 'boolean';
};
export type MultiselectPrompt = MultiselectPromptArgs & {
  type: 'multiselect';
};

export type Prompt = {
  name: string;
  text: string;
} & (TextPrompt | ConfirmPrompt | MultiselectPrompt);

export type IntegrationConfig = {
  env?: Record<string, any>;
  tasks: ModTask[];
  preInfo?: TextOrTitleMessage;
  postInfo?: TextOrTitleMessage;
  dependencies?: string[];
};

export type PackageWithConfig = {
  packageName: string;
  version: string;
  configPath: string;
  config: IntegrationConfig;
};

export type BlockContentType = {
  start: number;
  end: number;
  match: string;
  justCreated: boolean;
  space: string;
};

export type TaskState = {
  state: 'progress' | 'error' | 'skipped' | 'done';
  error: boolean;
  reason?: string;
};
