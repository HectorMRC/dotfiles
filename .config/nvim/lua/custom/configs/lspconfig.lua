local on_attach = require("plugins.configs.lspconfig").on_attach
local capabilities = require("plugins.configs.lspconfig").capabilities
local lspconfig = require("lspconfig")

-- Rust lsp config
lspconfig.rust_analyzer.setup({
    on_attach = function (client, bufnr)
        local on_attach = require("plugins.configs.lspconfig").on_attach
        on_attach(client, bufnr)
        -- disable LSP highlighting
        client.server_capabilities.semanticTokensProvider = nil
    end,
    capabilities = capabilities,
    filetypes = {"rust"},
    root_dir = lspconfig.util.root_pattern("Cargo.toml"),
})