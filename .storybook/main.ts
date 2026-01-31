import type { StorybookConfig } from '@storybook/sveltekit';
import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts|svelte)'],
  addons: [
    '@storybook/addon-svelte-csf',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/sveltekit',
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          $lib: path.resolve(__dirname, '../src/lib'),
        },
      },
    });
  },
};

export default config;