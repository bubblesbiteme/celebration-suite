import {defineConfig, devices} from '@playwright/test';

const baseURL=process.env.CS_E2E_BASE_URL||'http://127.0.0.1:8888';
export default defineConfig({
  testDir:'./tests/e2e',
  timeout:45_000,
  expect:{timeout:8_000},
  fullyParallel:false,
  retries:process.env.CI?2:0,
  reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
  use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['Pixel 7']}}
  ]
});
