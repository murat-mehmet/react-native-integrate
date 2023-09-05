import fs from 'fs';
import mergeWith from 'lodash.mergewith';
import path from 'path';
import color from 'picocolors';
import plist from 'simple-plist';
import { Constants } from '../constants';
import { logMessage, summarize } from '../prompter';
import { PlistModifierType, PlistTaskType } from '../types/mod.types';
import { getIosProjectName } from '../utils/getIosProjectPath';
import { getProjectPath } from '../utils/getProjectPath';

export function plistTask(args: {
  configPath: string;
  packageName: string;
  content: Record<string, any>;
  task: PlistTaskType;
}): Record<string, any> {
  let { content } = args;
  const { task } = args;

  task.updates.forEach(update => {
    content = applyPlistModification(content, update);
  });

  return content;
}

function applyPlistModification(
  content: Record<string, any>,
  update: PlistModifierType
) {
  const strategy = update.strategy || 'assign';

  if (strategy == 'assign') {
    content = Object.assign(content, update.set);
  } else {
    /* eslint-disable @typescript-eslint/no-unsafe-return */
    const customizer = function (objValue: any, srcValue: any) {
      if (strategy == 'merge_concat')
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          return objValue.concat(srcValue);
        }
      if (typeof srcValue === 'object' && srcValue.$assign) {
        delete srcValue.$assign;
        return srcValue;
      }
      if (
        Array.isArray(objValue) &&
        typeof srcValue === 'object' &&
        srcValue.$index != null
      ) {
        const index = srcValue.$index;
        delete srcValue.$index;
        objValue[index] = mergeWith(objValue[index], srcValue, customizer);

        return objValue;
      }
    };

    content = mergeWith(content, update.set, customizer);
    /* eslint-enable @typescript-eslint/no-unsafe-return */
  }

  content = Object.keys(content)
    .sort()
    .reduce((temp_obj, key) => {
      temp_obj[key] = content[key];
      return temp_obj;
    }, {} as Record<string, any>);
  Object.entries(update.set).forEach(([key, value]) => {
    value = typeof value === 'string' ? value : JSON.stringify(value);
    logMessage(
      `set ${color.yellow(key)} with ${color.yellow(
        strategy
      )} strategy in plist: ${summarize(value)}`
    );
  });

  return content;
}

function getPListPath(target: string | undefined) {
  if (!target) target = getIosProjectName();
  const projectPath = getProjectPath();
  const pListPath = path.join(
    projectPath,
    'ios',
    target,
    Constants.PLIST_FILE_NAME
  );
  if (!fs.existsSync(pListPath))
    throw new Error(`Plist file not found at ${pListPath}`);
  return pListPath;
}

function readPListContent(target: string | undefined) {
  const appDelegatePath = getPListPath(target);
  return plist.parse(fs.readFileSync(appDelegatePath, 'utf-8'));
}

function writePListContent(
  content: Record<string, any>,
  target: string | undefined
): void {
  const appDelegatePath = getPListPath(target);
  return fs.writeFileSync(appDelegatePath, plist.stringify(content), 'utf-8');
}

export function runTask(args: {
  configPath: string;
  packageName: string;
  task: PlistTaskType;
}): void {
  let content = readPListContent(args.task.target);

  content = plistTask({
    ...args,
    content,
  });

  writePListContent(content, args.task.target);
}
