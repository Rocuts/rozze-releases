# RoZze para Windows — versiones publicadas

## Español

**RoZze** es un companion de escritorio local para directos de TikTok LIVE: eventos en tiempo real, overlays
para tu emisión y voz, todo en tu propio ordenador. **No emite, no usa la cámara y nunca escribe en TikTok.**

### Qué hay aquí

Este repositorio **solo contiene versiones publicadas**, sin código fuente. Cada Release lleva exactamente tres archivos:

- `RoZze-Setup-X.Y.Z.exe`: el instalador de Windows.
- `rozze-update.json`: el manifiesto de actualización firmado; la app verifica su firma antes de ofrecer una actualización.
- `SHA512SUMS`: la suma de verificación del instalador.

**Aún no hay versiones publicadas.**

### Cómo descargar

- **Desde la app:** RoZze te avisa cuando hay una versión nueva y la instala por ti.
- **A mano:** en [Releases](https://github.com/Rocuts/rozze-releases/releases).

### Requisitos

Windows 11 (x64).

### Verificar la descarga a mano

En PowerShell, en la carpeta de la descarga:

```powershell
Get-FileHash .\RoZze-Setup-X.Y.Z.exe -Algorithm SHA512
```

Compara el resultado con la línea de `SHA512SUMS` (formato `hash  nombre`). PowerShell devuelve el hash en
MAYÚSCULAS y `SHA512SUMS` lo lleva en minúsculas: la comparación debe ignorar mayúsculas y minúsculas.

### Aviso sobre la firma

El instalador **aún no lleva firma Authenticode**, por lo que Windows SmartScreen puede mostrar un aviso al
ejecutarlo. Verifica el hash como se indica arriba antes de instalar.

### Política de publicación

- Solo se publican versiones estables `vX.Y.Z`, cada una con los tres assets anteriores. No hay prereleases.
- Nunca se sobrescribe ni se borra un asset publicado.
- Una versión defectuosa se corrige publicando una versión mayor.
- Cada publicación se comprueba automáticamente (coherencia de nombres, tamaño y hash).

### Aviso legal

RoZze es una aplicación independiente y no está afiliada a TikTok. Problemas de seguridad: ver [SECURITY.md](SECURITY.md).

Creado por Orbexs con amor para Dory · https://www.orbexs.co

---

## English

**RoZze** is a local desktop companion for TikTok LIVE streams: real-time events, overlays for your broadcast
and voice, all on your own computer. **It does not broadcast, does not use the camera and never writes to TikTok.**

### What is here

This repository **only contains published versions**, no source code. Each Release carries exactly three files:

- `RoZze-Setup-X.Y.Z.exe`: the Windows installer.
- `rozze-update.json`: the signed update manifest; the app verifies its signature before offering an update.
- `SHA512SUMS`: the installer checksum.

**No versions published yet.**

### How to download

- **From the app:** RoZze tells you when a new version is available and installs it for you.
- **Manually:** from [Releases](https://github.com/Rocuts/rozze-releases/releases).

### Requirements

Windows 11 (x64).

### Verify your download manually

In PowerShell, in the download folder:

```powershell
Get-FileHash .\RoZze-Setup-X.Y.Z.exe -Algorithm SHA512
```

Compare the result with the matching line in `SHA512SUMS` (format `hash  name`). PowerShell prints the hash
in UPPERCASE while `SHA512SUMS` uses lowercase: compare case-insensitively.

### Signature notice

The installer **is not yet Authenticode-signed**, so Windows SmartScreen may show a warning when you run it.
Verify the hash as described above before installing.

### Publishing policy

- Only stable `vX.Y.Z` versions are published, each with the three assets above. No prereleases.
- A published asset is never overwritten or deleted.
- A defective version is fixed by publishing a higher version.
- Every publication is checked automatically (names, size and hash consistency).

### Disclaimer

RoZze is an independent application and is not affiliated with TikTok. Security issues: see [SECURITY.md](SECURITY.md).

Created by Orbexs with love for Dory · https://www.orbexs.co
