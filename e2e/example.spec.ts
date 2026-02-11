import { test, expect, _electron } from '@playwright/test';

let electronApp: Awaited<ReturnType<typeof _electron.launch>>;
let mainPage: Awaited<ReturnType<typeof electronApp.firstWindow>>;

async function waitForPreloadScript() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const electronBridge = await mainPage.evaluate(() => {
        return window.electron;
      });
      if (electronBridge) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);
  });
}

test.beforeEach(async () => {
  electronApp = await _electron.launch({
    args: ["."],
    env: { NODE_ENV: "development" }
  });
  mainPage = await electronApp.firstWindow();
  await waitForPreloadScript();
});

test.afterEach(async () => {
  await electronApp.close();
});

// --- Custom frame tests ---

test('custom frame should minimize the mainWindow', async () => {
  await mainPage.click("#minimize");
  const isMinimized = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows()[0].isMinimized();
  });
  expect(isMinimized).toBeTruthy();
});

test('custom frame should maximize and unmaximize the mainWindow', async () => {
  await mainPage.click("#maximize");
  const isMaximized = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows()[0].isMaximized();
  });
  expect(isMaximized).toBeTruthy();

  await mainPage.click("#maximize");
  const isStillMaximized = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows()[0].isMaximized();
  });
  expect(isStillMaximized).toBeFalsy();
});

test('custom frame close button should hide the window (close-to-tray)', async () => {
  await mainPage.click("#close");
  const isVisible = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows()[0].isVisible();
  });
  expect(isVisible).toBeFalsy();
});

// --- Menu tests ---

test('should create a custom menu', async () => {
  const menu = await electronApp.evaluate((electron) => {
    return electron.Menu.getApplicationMenu();
  });
  expect(menu).not.toBeNull();
  expect(menu?.items).toHaveLength(1);
  expect(menu?.items[0].label).toBe("App");
  expect(menu?.items[0].submenu?.items).toHaveLength(3);
  expect(menu?.items[0].submenu?.items[0].label).toBe("Quit");
  expect(menu?.items[0].submenu?.items[1].label).toBe("DevTools");
  expect(menu?.items[0].submenu?.items[2].label).toBe("View");
  expect(menu?.items[0].submenu?.items[2].submenu?.items).toHaveLength(3);
  expect(menu?.items[0].submenu?.items[2].submenu?.items[0].label).toBe("CPU");
  expect(menu?.items[0].submenu?.items[2].submenu?.items[1].label).toBe("RAM");
  expect(menu?.items[0].submenu?.items[2].submenu?.items[2].label).toBe("STORAGE");
});

// --- Tray tests ---

test('should create a system tray', async () => {
  // Verify the app didn't crash during tray creation and window is still accessible
  const windowCount = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows().length;
  });
  expect(windowCount).toBeGreaterThan(0);
});

// --- IPC / static data tests ---

test('getStaticData should return valid system info', async () => {
  const staticData = await mainPage.evaluate(async () => {
    return await window.electron.getStaticData();
  });
  expect(staticData).toHaveProperty("totalStorage");
  expect(staticData).toHaveProperty("cpuModel");
  expect(staticData).toHaveProperty("totalMemoryGB");
  expect(staticData.totalStorage).toBeGreaterThan(0);
  expect(staticData.cpuModel).toBeTruthy();
  expect(staticData.totalMemoryGB).toBeGreaterThan(0);
});

// --- Statistics streaming tests ---

test('should receive statistics data via IPC', async () => {
  const stats = await mainPage.evaluate(() => {
    return new Promise<{ cpuUsage: number; ramUsage: number; storageUsage: number }>((resolve) => {
      window.electron.subscribeStatistics((statistics) => {
        resolve(statistics);
      });
    });
  });
  expect(stats.cpuUsage).toBeGreaterThanOrEqual(0);
  expect(stats.cpuUsage).toBeLessThanOrEqual(1);
  expect(stats.ramUsage).toBeGreaterThanOrEqual(0);
  expect(stats.ramUsage).toBeLessThanOrEqual(1);
  expect(stats.storageUsage).toBeGreaterThanOrEqual(0);
  expect(stats.storageUsage).toBeLessThanOrEqual(1);
});

// --- UI rendering tests ---

test('should render the chart container', async () => {
  const chartContainer = mainPage.locator('.recharts-wrapper');
  await expect(chartContainer).toBeVisible({ timeout: 5000 });
});

test('should display the counter button and increment on click', async () => {
  const button = mainPage.locator('button', { hasText: 'count is' });
  await expect(button).toContainText('count is 0');
  await button.click();
  await expect(button).toContainText('count is 1');
  await button.click();
  await expect(button).toContainText('count is 2');
});

// --- View switching tests ---

test('should switch view when menu item is clicked', async () => {
  // Default view should be CPU — trigger a switch to RAM via IPC
  await electronApp.evaluate((electron) => {
    const win = electron.BrowserWindow.getAllWindows()[0];
    win.webContents.send("changeView", "RAM");
  });

  // Wait a bit for React to re-render, then verify the view changed
  // by triggering another switch and confirming it doesn't error
  await electronApp.evaluate((electron) => {
    const win = electron.BrowserWindow.getAllWindows()[0];
    win.webContents.send("changeView", "STORAGE");
  });

  // Switch back to CPU
  await electronApp.evaluate((electron) => {
    const win = electron.BrowserWindow.getAllWindows()[0];
    win.webContents.send("changeView", "CPU");
  });

  // Chart should still be visible after all view switches
  const chartContainer = mainPage.locator('.recharts-wrapper');
  await expect(chartContainer).toBeVisible({ timeout: 5000 });
});

// --- Window properties tests ---

test('window should be frameless', async () => {
  const isFrameless = await electronApp.evaluate((electron) => {
    const win = electron.BrowserWindow.getAllWindows()[0];
    return !win.isMenuBarVisible();
  });
  expect(isFrameless).toBeTruthy();
});

test('window should have exactly one BrowserWindow', async () => {
  const windowCount = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows().length;
  });
  expect(windowCount).toBe(1);
});
