---@brief
---
--- https://github.com/neovim/nvim-lspconfig/blob/master/lsp/ts_ls.lua
--- https://github.com/typescript-language-server/typescript-language-server
---
--- TypeScript language server. Uses the TypeScript from the project's node_modules.

---@type vim.lsp.Config
return {
    cmd = { "typescript-language-server", "--stdio" },
    filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
    root_markers = { "tsconfig.json", "jsconfig.json", "package.json", ".git" },
}
