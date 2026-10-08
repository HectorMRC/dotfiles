-- NvChad lazy-loads it; load it at startup so its `lsp/` configs exist for `vim.lsp.enable`.
return {
    "neovim/nvim-lspconfig",
    lazy = false,
}
