import type { Preview } from '@storybook/svelte-vite';
import '../src/app.css';

const VIEWPORTS = {
  iphone14: {
    name: 'iPhone 14',
    styles: { width: '390px', height: '844px' },
  },
  iphone14ProMax: {
    name: 'iPhone 14 Pro Max',
    styles: { width: '430px', height: '932px' },
  },
  ipadMini: {
    name: 'iPad Mini',
    styles: { width: '744px', height: '1133px' },
  },
  ipadPro: {
    name: 'iPad Pro 12.9"',
    styles: { width: '1024px', height: '1366px' },
  },
  desktop: {
    name: 'Desktop HD',
    styles: { width: '1920px', height: '1080px' },
  },
  desktop4k: {
    name: 'Desktop 4K',
    styles: { width: '2560px', height: '1440px' },
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'game',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#ffffff' },
        { name: 'game', value: '#16213e' },
      ],
    },
    viewport: {
      viewports: VIEWPORTS,
      defaultViewport: 'desktop',
    },
    layout: 'fullscreen',
  },
};

export default preview;