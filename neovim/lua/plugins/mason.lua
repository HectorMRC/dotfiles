local is_nixos = vim.loop.fs_stat "/etc/nixos" ~= nil

return {
    "mason-org/mason.nvim",
    enabled = not is_nixos,
    lazy = false,
    opts = {
        ensure_installed = {
            "black",
            "lua-language-server",
            "nixfmt",
            "python-lsp-server",
            "rust-analyzer",
            "stylua",
            "tombi",
        },
    },
}
