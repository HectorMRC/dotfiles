local function config()
    require("nvchad.configs.lspconfig").defaults()

    -- find lsp configurations here:
    -- https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md

    vim.lsp.enable({
        "lua_ls",
        "rnix",
        "rust_analyzer",
        -- "taplo", -- use tombi instead
        "tombi",
    })
end

return {
    "neovim/nvim-lspconfig",
    dependencies = {
        "mason-org/mason.nvim",
    },
    config = config,
}
