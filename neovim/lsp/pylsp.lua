---@brief
---
--- https://github.com/neovim/nvim-lspconfig/blob/master/lsp/pylsp.lua
---
--- Python language server.

---@type vim.lsp.Config
return {
    cmd = { "pylsp" },
    filetypes = { "python" },
    root_markers = {
        "pyproject.toml",
        "setup.py",
        "setup.cfg",
        "requirements.txt",
        "Pipfile",
        ".git",
    },
}
