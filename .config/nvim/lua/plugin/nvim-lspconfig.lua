local function config()
    require("nvchad.configs.lspconfig").defaults()

    -- find lsp configurations here:
    -- https://github.com/neovim/nvim-lspconfig/blob/master/doc/configs.md

    vim.lsp.config('rust_analyzer', {
        settings = {
            ['rust-analyzer'] = {
                diagnostics = {
                    enable = false;
                }
            }
        }
    })

    vim.lsp.enable({ 
        "lua_ls",
        "rust_analyzer",
    })
end

return {
  "neovim/nvim-lspconfig",
   config = config,
}
