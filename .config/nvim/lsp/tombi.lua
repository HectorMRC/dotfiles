---@brief
---
--- https://github.com/neovim/nvim-lspconfig/blob/master/lsp/tombi.lua
--- https://tombi-toml.github.io/tombi/
---
--- TOML language server.
---

---@type vim.lsp.Config
return {
    cmd = { "tombi", "lsp" },
    filetypes = { "toml" },
    root_markers = { "tombi.toml", "pyproject.toml", ".git" },
}
