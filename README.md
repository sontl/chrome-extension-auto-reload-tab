# Auto Tab Reloader Chrome Extension

This Chrome extension allows you to automatically reload specific tabs at random intervals between 1 and 10 minutes.

## Features

- Select which tabs to auto-reload
- Random reload intervals between 1-10 minutes
- Clean and simple interface
- Persists settings across browser sessions

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Click the extension icon in your Chrome toolbar
2. You'll see a list of all your open tabs
3. Toggle the switch next to any tab you want to auto-reload
4. The selected tabs will automatically reload at random intervals between 1-10 minutes

## Development

The extension consists of the following files:
- `manifest.json`: Extension configuration
- `background.js`: Handles tab reloading logic
- `popup.html`: User interface
- `popup.js`: Popup interface logic
- `icons/`: Directory containing extension icons

## Notes

- The extension will stop auto-reloading tabs when they are closed
- Settings are maintained until you disable the extension
- Each tab reloads independently with its own random interval 