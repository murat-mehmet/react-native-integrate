import fs from 'fs';
import path from 'path';
import { Constants } from '../constants';
import {
  AppDelegateBlockType,
  AppDelegateTaskType,
  BlockContentType,
} from '../types/mod.types';
import { applyContentModification } from '../utils/applyContentModification';
import { findClosingTagIndex } from '../utils/findClosingTagIndex';
import { getErrMessage } from '../utils/getErrMessage';
import { getIosProjectPath } from '../utils/getIosProjectPath';
import { satisfies } from '../utils/satisfies';
import { setState } from '../utils/setState';
import { stringSplice } from '../utils/stringSplice';
import { variables } from '../variables';

export async function appDelegateTask(args: {
  configPath: string;
  packageName: string;
  content: string;
  task: AppDelegateTaskType;
}): Promise<string> {
  let { content } = args;
  const { task, configPath, packageName } = args;

  for (const action of task.actions) {
    variables.set('CONTENT', content);
    if (action.when && !satisfies(variables.getStore(), action.when)) {
      setState(action.name, {
        state: 'skipped',
        reason: 'when',
        error: false,
      });
      continue;
    }

    setState(action.name, {
      state: 'progress',
      error: false,
    });
    try {
      content = await applyContentModification({
        action,
        findOrCreateBlock,
        configPath,
        packageName,
        content,
        indentation: 2,
      });

      setState(action.name, {
        state: 'done',
        error: false,
      });
    } catch (e) {
      setState(action.name, {
        state: 'error',
        reason: getErrMessage(e),
        error: true,
      });
      throw e;
    }
  }

  return content;
}

function findOrCreateBlock(
  content: string,
  block: string
): {
  blockContent: BlockContentType;
  content: string;
} {
  let blockContent = {
    start: 0,
    end: content.length,
    match: content,
    space: '',
    justCreated: false,
  };
  const blockDefinition = blockDefinitions[block as AppDelegateBlockType];

  if (!blockDefinition) throw new Error(`Invalid block: ${block}`);
  const { regex, makeNewMethod } = blockDefinition;
  let blockStart = regex.exec(content);

  const justCreated = !blockStart;
  if (!blockStart) {
    const newMethod = makeNewMethod();
    content = appendNewMethod(content, newMethod);

    blockStart = regex.exec(content);
  }
  if (!blockStart) {
    throw new Error('block could not be inserted, something wrong?');
  }
  const blockEndIndex = findClosingTagIndex(
    content,
    blockStart.index + blockStart[0].length
  );
  const blockBody = content.substring(
    blockStart.index + blockStart[0].length,
    blockEndIndex
  );
  blockContent = {
    start: blockStart.index + blockStart[0].length,
    end: blockEndIndex,
    match: blockBody,
    justCreated,
    space: '',
  };

  return {
    blockContent,
    content,
  };
}

const blockDefinitions: Record<
  AppDelegateBlockType,
  { regex: RegExp; makeNewMethod: () => string }
> = {
  didFinishLaunchingWithOptions: {
    regex: /didFinishLaunchingWithOptions.*?\{/s,
    makeNewMethod: () => {
      throw new Error(
        'didFinishLaunchingWithOptions not implemented, something is wrong?'
      );
    },
  },
  applicationDidBecomeActive: {
    regex: /applicationDidBecomeActive.*?\{/s,
    makeNewMethod: () => {
      return '- (void)applicationDidBecomeActive:(UIApplication *)application {}';
    },
  },
  applicationWillResignActive: {
    regex: /applicationWillResignActive.*?\{/s,
    makeNewMethod: () => {
      return '- (void)applicationWillResignActive:(UIApplication *)application {}';
    },
  },
  applicationDidEnterBackground: {
    regex: /applicationDidEnterBackground.*?\{/s,
    makeNewMethod: () => {
      return '- (void)applicationDidEnterBackground:(UIApplication *)application {}';
    },
  },
  applicationWillEnterForeground: {
    regex: /applicationWillEnterForeground.*?\{/s,
    makeNewMethod: () => {
      return '- (void)applicationWillEnterForeground:(UIApplication *)application {}';
    },
  },
  applicationWillTerminate: {
    regex: /applicationWillTerminate.*?\{/s,
    makeNewMethod: () => {
      return '- (void)applicationWillTerminate:(UIApplication *)application {}';
    },
  },
  openURL: {
    regex: /openURL:.*?options:.*?\{/s,
    makeNewMethod: () => {
      // noinspection SpellCheckingInspection
      return '- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {}';
    },
  },
  restorationHandler: {
    regex: /continueUserActivity:.*?restorationHandler:.*?\{/s,
    makeNewMethod: () => {
      return '- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *))restorationHandler {}';
    },
  },
  didRegisterForRemoteNotificationsWithDeviceToken: {
    regex: /didRegisterForRemoteNotificationsWithDeviceToken.*?\{/s,
    makeNewMethod: () => {
      return '- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {}';
    },
  },
  didFailToRegisterForRemoteNotificationsWithError: {
    regex: /didFailToRegisterForRemoteNotificationsWithError.*?\{/s,
    makeNewMethod: () => {
      return '- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {}';
    },
  },
  didReceiveRemoteNotification: {
    regex: /didReceiveRemoteNotification((?!fetchCompletionHandler).)*?\{/s,
    makeNewMethod: () => {
      return '- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {}';
    },
  },
  fetchCompletionHandler: {
    regex: /didReceiveRemoteNotification:.*?fetchCompletionHandler:.*?\{/s,
    makeNewMethod: () => {
      return '- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {}';
    },
  },
};

function appendNewMethod(content: string, newMethod: string): string {
  const appDelegateMatch = /@implementation AppDelegate.*?@end/s.exec(content);
  if (!appDelegateMatch)
    throw new Error('Could not find @implementation AppDelegate');
  const codeToInsert = `${newMethod}

`;
  return stringSplice(
    content,
    appDelegateMatch.index + appDelegateMatch[0].length - 4,
    0,
    codeToInsert
  );
}

function getAppDelegatePath() {
  const iosProjectPath = getIosProjectPath();

  const appDelegatePath = path.join(
    iosProjectPath,
    Constants.APP_DELEGATE_FILE_NAME
  );
  if (!fs.existsSync(appDelegatePath))
    throw new Error(`AppDelegate file not found at ${appDelegatePath}`);
  return appDelegatePath;
}

function readAppDelegateContent() {
  const appDelegatePath = getAppDelegatePath();
  return fs.readFileSync(appDelegatePath, 'utf-8');
}

function writeAppDelegateContent(content: string): void {
  const appDelegatePath = getAppDelegatePath();
  return fs.writeFileSync(appDelegatePath, content, 'utf-8');
}

export async function runTask(args: {
  configPath: string;
  packageName: string;
  task: AppDelegateTaskType;
}): Promise<void> {
  let content = readAppDelegateContent();

  content = await appDelegateTask({
    ...args,
    content,
  });

  writeAppDelegateContent(content);
}

export const summary = 'AppDelegate.mm modification';
