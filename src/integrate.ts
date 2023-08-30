import color from 'picocolors';
import {
  confirm,
  log,
  logError,
  logInfo,
  logSuccess,
  logWarning,
  startSpinner,
  stopSpinner,
} from './prompter';
import { LockProjectData } from './types/integrator.types';
import { analyzePackages } from './utils/analyzePackages';
import { getPackageConfig } from './utils/getPackageConfig';
import { parseConfig } from './utils/parseConfig';
import { runTask } from './utils/runTask';
import { updateIntegrationStatus } from './utils/updateIntegrationStatus';

export async function integrate(): Promise<void> {
  startSpinner('analyzing packages');
  const { newPackages, deletedPackages, installedPackages } = analyzePackages();

  // get packages that need to be implemented
  let msg = `analyzed ${installedPackages.length} packages`;
  if (newPackages.length || deletedPackages.length) {
    if (newPackages.length > 0) {
      msg += color.green(` | ${newPackages.length} new package(s)`);
    }
    if (deletedPackages.length > 0) {
      msg += color.gray(` | ${deletedPackages.length} deleted package(s)`);
    }
  } else {
    msg += ' | no changes';
  }
  stopSpinner(msg);
  const packageLockUpdates: {
    packageName: string;
    lockProjectData: LockProjectData;
  }[] = [];
  const packagesToIntegrate: {
    packageName: string;
    version: string;
    configPath: string;
  }[] = [];
  if (newPackages.length) {
    startSpinner('checking new packages');
    for (let i = 0; i < newPackages.length; i++) {
      const [packageName, version] = newPackages[i];
      const configPath = await getPackageConfig(packageName, {
        index: i,
        count: newPackages.length,
      });
      if (!configPath)
        packageLockUpdates.push({
          packageName,
          lockProjectData: {
            version,
            integrated: false,
          },
        });
      else
        packagesToIntegrate.push({
          packageName,
          version,
          configPath,
        });
    }
    let msg = 'checked new packages';
    if (packagesToIntegrate.length > 0) {
      msg += color.green(
        ` | ${packagesToIntegrate.length} package needs integration`
      );
    } else {
      msg += ' | no integration needed.';
    }
    stopSpinner(msg);
  }
  if (packagesToIntegrate.length) {
    for (let i = 0; i < packagesToIntegrate.length; i++) {
      const { packageName, version, configPath } = packagesToIntegrate[i];
      const config = parseConfig(configPath);
      logInfo(
        color.bold(color.bgBlue(' new package ')) +
          color.bold(color.blue(` ${packageName} `))
      );
      if (await confirm('would you like to integrate this package?')) {
        let failedTaskCount = 0;
        config.tasks.forEach((task, i) => {
          log(
            color.cyan(`[${i + 1}/${config.tasks.length}]`) +
              ' ' +
              color.bold(task.label || 'task: ' + task.type)
          );
          try {
            runTask({
              configPath,
              packageName,
              task,
            });
          } catch (e) {
            failedTaskCount++;
            logError(e instanceof Error ? e.message : 'An error occurred');
          }
        });
        if (failedTaskCount) {
          logWarning(
            color.inverse(
              color.bold(color.yellow(' integrated with errors '))
            ) +
              color.bold(color.blue(` ${packageName} `)) +
              color.yellow(
                `failed to complete ${failedTaskCount} task(s) - please complete this integration manually`
              ),
            true
          );
          logWarning(
            `failed to complete ${failedTaskCount} task(s) - please complete integration manually`
          );
        } else {
          logSuccess(
            color.inverse(color.bold(color.green(' integrated '))) +
              color.black(color.bold(color.blue(` ${packageName} `))) +
              color.green(
                `completed ${config.tasks.length} task(s) successfully`
              )
          );
        }
        packageLockUpdates.push({
          packageName,
          lockProjectData: {
            version,
            integrated: true,
          },
        });
      } else {
        packageLockUpdates.push({
          packageName,
          lockProjectData: {
            version,
            integrated: false,
          },
        });
        log(color.gray(color.italic('skipped package integration')));
      }
    }
  }
  for (let i = 0; i < deletedPackages.length; i++) {
    const [packageName, lockProjectData] = deletedPackages[i];
    lockProjectData.deleted = true;
    packageLockUpdates.push({
      packageName,
      lockProjectData,
    });
  }
  updateIntegrationStatus(packageLockUpdates);
}
