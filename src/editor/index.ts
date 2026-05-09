import ace from "ace-builds"
import "ace-builds/src-noconflict/mode-markdown"
import "ace-builds/src-noconflict/keybinding-vscode"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/theme-github_dark"

import { commands } from "./commands"

// Ace Editor のインスタンス
export const editor = ace.edit("editor", {
  mode: "ace/mode/markdown",
  useSoftTabs: true,
  keyboardHandler: "ace/keyboard/vscode",
  theme: "ace/theme/github",
})

// コマンド
editor.commands.addCommands(commands)
