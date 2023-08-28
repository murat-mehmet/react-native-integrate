/* eslint-disable @typescript-eslint/no-unsafe-call */

require('./mockProjectPath');
require('./mockFetch');
const { mockPrompter } = require('./mockPrompter');
const { mockFs } = require('./mockFs');

import path from 'path';
import { Constants } from '../../constants';
import { LockData } from '../../types/integrator.types';
import { mockAppDelegateTemplate } from './mockAppDelegateTemplate';

function writeMockProject(projectJson: Record<any, any>): string {
  const packageJsonPath = path.resolve(
    __dirname,
    `../mock-project/${Constants.PACKAGE_JSON_FILE_NAME}`
  );
  mockFs.writeFileSync(packageJsonPath, JSON.stringify(projectJson, null, 2));
  return packageJsonPath;
}

function writeMockLock(lockData: LockData): string {
  const lockPath = path.resolve(
    __dirname,
    `../mock-project/${Constants.LOCK_FILE_NAME}`
  );
  mockFs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2));
  return lockPath;
}
function writeMockAppDelegate(
  appDelegateContent = mockAppDelegateTemplate
): string {
  const appDelegatePath = path.resolve(
    __dirname,
    `../mock-project/ios/test/${Constants.APP_DELEGATE_FILE_NAME}`
  );
  mockFs.writeFileSync(appDelegatePath, appDelegateContent);
  return appDelegatePath;
}

let didSetup = false;
if (!didSetup) {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockFs.reset();

    // add package.json to mockFs
    writeMockProject({
      name: 'mock-project',
      version: '0.0.0',
      description: 'Mock project',
      dependencies: {
        'mock-package': '^1.2.3',
      },
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  didSetup = true;
}

export {
  mockFs,
  mockPrompter,
  writeMockProject,
  writeMockLock,
  writeMockAppDelegate,
};
