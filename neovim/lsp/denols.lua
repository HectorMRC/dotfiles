---@brief
---
--- https://github.com/neovim/nvim-lspconfig/blob/master/lsp/denols.lua
--- https://docs.deno.com/runtime/reference/lsp_integration/
---
--- Deno language server. Only starts in projects with a deno.json.

---@type vim.lsp.Config
return {
    cmd = { "deno", "lsp" },
    filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact" },
    root_markers = { "deno.json", "deno.jsonc" },
    workspace_required = true,
    settings = { deno = { enable = true } },
}
