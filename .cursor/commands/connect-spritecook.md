---
name: connect-spritecook
description: Guide the user through connecting SpriteCook in Cursor and verify the connection.
---

# Connect SpriteCook

Use this command when the user installed the plugin but has not connected their SpriteCook account yet.

## Steps

1. Explain that SpriteCook needs a connected account before generation works.
2. Walk the user through Cursor's built-in sign-in:
   - Open Cursor Settings, then Tools & MCP.
   - Enable `spritecook`.
   - Complete the SpriteCook sign-in in the browser when prompted.
3. If the server doesn't appear, ask the user to fully quit and reopen Cursor.
4. Verify the connection by calling `get_credit_balance`.
5. If it works, suggest a first test prompt, such as "Generate a tiny pixel art knight, idle pose."

## If It Fails

- `401` or `403`: the sign-in is missing or expired. Reconnect `spritecook` from Tools & MCP.
- Server missing: check that the plugin is installed and enabled, and that `spritecook` is turned on in Tools & MCP.
- No tools visible: check that the `spritecook` server is active.
- Sign-in keeps failing: point the user to https://spritecook.ai/cursor for setup help.

Do not run setup scripts, install packages, edit MCP configuration files, or ask for an API key. The plugin already provides the SpriteCook server.
