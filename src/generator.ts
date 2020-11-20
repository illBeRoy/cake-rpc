#!/usr/bin/env node
import path from 'path';
import prompts from 'prompts';
import fs from 'fs-extra';
import globby from 'globby';
import lodashTemplate from 'lodash.template';
import execa from 'execa';

export const generatePackage = async (cwd: string) => {
  const {
    packageName,
    language,
    packageManager,
  }: {
    packageName: string;
    language: string;
    packageManager: string;
  } = await prompts([
    {
      name: 'packageName',
      type: 'text',
      message: 'Select the desired package name for your new service',
    },
    {
      name: 'language',
      type: 'select',
      message: 'Which language do you use?',
      choices: [
        { title: 'typescript', value: 'ts' },
        { title: 'javascript', value: 'js' },
      ],
    },
    {
      name: 'packageManager',
      type: 'select',
      message: 'Which package manager to use?',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'skip installation', value: 'skip' },
      ],
    },
  ]);

  const targetPath = path.join(cwd, ...packageName.split('/'));
  if (await fs.pathExists(targetPath)) {
    console.error(`⛔️ The path already exists ("${targetPath}")`);
    return process.exit(1);
  }

  const templatePath = path.join(
    __dirname,
    '..',
    '..',
    'assets',
    'templates',
    `service-package-${language}`
  );

  await fs.copy(templatePath, targetPath);

  const templateParameters = {
    packageName,
  };

  const allFiles = await globby(path.join(targetPath, '**', '*'));
  await Promise.all(
    allFiles.map(async (file) => {
      const templateContents = await fs.readFile(file, 'utf-8');
      const renderedContents = lodashTemplate(templateContents)(
        templateParameters
      );

      await fs.writeFileSync(file, renderedContents);
    })
  );

  switch (packageManager) {
    case 'npm':
      await execa('npm', ['install'], { cwd: targetPath });
      break;

    case 'yarn':
      await execa('yarn', { cwd: targetPath });
      break;

    case 'skip':
    default:
  }

  console.log('✅ Package generated successfully!');
};

if (require.main === module) {
  generatePackage(process.cwd())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
