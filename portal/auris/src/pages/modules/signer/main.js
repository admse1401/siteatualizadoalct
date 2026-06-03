
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 750,
    title: "Auris Signer Pro",
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

ipcMain.handle('get-system-certificates', async () => {
  return new Promise((resolve) => {
    // Busca certificados no repositório pessoal do Windows
    const cmd = `powershell -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $certs = Get-ChildItem -Path Cert:\\CurrentUser\\My | Where-Object { $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date) } | Select-Object Subject, Issuer, NotAfter, Thumbprint; if ($certs) { ConvertTo-Json -InputObject @($certs) -Compress } else { '[]' }"`;
    
    exec(cmd, { encoding: 'utf8' }, (error, stdout) => {
      if (error) return resolve([]);
      try {
        const output = stdout.trim();
        if (!output || output === '[]') return resolve([]);
        const certList = JSON.parse(output);
        const formatted = certList.map(c => ({
          commonName: (c.Subject || '').replace('CN=', '').split(',')[0].trim(),
          issuer: (c.Issuer || '').replace('CN=', '').split(',')[0].trim(),
          expiryDate: c.NotAfter,
          thumbprint: c.Thumbprint
        }));
        resolve(formatted);
      } catch (e) {
        resolve([]);
      }
    });
  });
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
