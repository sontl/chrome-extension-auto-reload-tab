# noVNC Connection Keeper Chrome Extension

This Chrome extension automatically refreshes noVNC connections at random intervals to keep them active. It's specifically designed to work with noVNC web-based VNC clients.

## Features

- Automatically detects and manages noVNC connections
- Refreshes connections at random intervals (30 seconds to 2 minutes)
- Persists settings across browser sessions
- Real-time countdown display for next refresh
- Independent refresh schedules for each connection
- Automatic recovery after browser restarts

## Technical Details

### How It Works

1. **noVNC Detection**
   - Checks for noVNC-specific elements (`canvas.vnc-canvas`, `div.noVNC_canvas`)
   - Verifies page title for "noVNC" keyword
   - Only enables auto-refresh for valid noVNC connections

2. **Refresh Mechanism**
   - Each connection has its own independent refresh timer
   - Random intervals between 30 seconds and 2 minutes
   - Includes 1-second delay before refresh to allow proper WebSocket disconnection
   - Waits for page to fully load before scheduling next refresh

3. **State Persistence**
   - Saves enabled tabs in Chrome's local storage
   - Automatically restores settings on:
     - Browser startup
     - Extension installation/update
     - Extension reload
   - Verifies and re-enables only valid noVNC connections

4. **Safety Features**
   - Automatically disables refresh if:
     - Tab is closed
     - Connection is no longer noVNC
     - Page fails to load
   - Handles errors gracefully with console logging
   - Prevents memory leaks from orphaned timers

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Open your noVNC connections in Chrome tabs
2. Click the extension icon in your Chrome toolbar
3. You'll see a list of all your open tabs
4. Toggle the switch next to any noVNC tab you want to keep active
5. The extension will:
   - Verify it's a valid noVNC connection
   - Show a countdown to the next refresh
   - Automatically refresh the connection
   - Continue until manually disabled or browser closed

## File Structure

- `manifest.json`: Extension configuration and permissions
- `background.js`: Core functionality for tab management and refresh scheduling
- `popup.html`: User interface for managing connections
- `popup.js`: Popup interface logic and timer display
- `icons/`: Directory containing extension icons

## Permissions

The extension requires the following permissions:
- `tabs`: To access and reload tabs
- `storage`: To persist settings
- `scripting`: To detect noVNC elements
- `host_permissions`: To check any URL for noVNC connections

## Troubleshooting

If auto-refresh stops working:
1. Check if the tab is still a valid noVNC connection
2. Verify the extension is enabled in Chrome
3. Check the browser console for any error messages
4. Try manually toggling the auto-refresh switch

## Notes

- The extension will only work with noVNC web-based VNC clients
- Each connection refreshes independently with its own random interval
- Settings persist until manually disabled or browser closed
- The extension automatically cleans up invalid or closed connections
- Refresh intervals are randomized to prevent all connections from refreshing simultaneously 