-- Base configurations come from nvim-lspconfig:
-- https://github.com/neovim/nvim-lspconfig/tree/master/lsp
-- `lsp/` only holds local overrides.

vim.lsp.enable {
    "denols",
    "lua_ls",
    "nixd",
    "pylsp",
    "rust_analyzer",
    "slint_lsp",
    "tombi",
    "ts_ls",
}

local format_on_save = {
    lua_ls = "stylua %",
    nixd = "nixfmt %",
    pylsp = "black %",
    slint_lsp = "slint-lsp format % --inline",
    tombi = "tombi format %",
    ts_ls = "biome format --write %",
}

vim.api.nvim_create_autocmd("LspAttach", {
    callback = function(args)
        local client = vim.lsp.get_client_by_id(args.data.client_id)
        local cmd = client and format_on_save[client.name]
        if not cmd then
            return
        end

        vim.api.nvim_create_autocmd("BufWritePost", {
            group = vim.api.nvim_create_augroup("format_on_save_" .. args.buf, {}),
            buffer = args.buf,
            callback = function()
                vim.cmd("silent! !" .. cmd)
            end,
        })
    end,
})
