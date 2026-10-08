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
    -- Leave Deno projects to denols.
    root_dir = function(bufnr, on_dir)
        if vim.fs.root(bufnr, { "deno.json", "deno.jsonc" }) then
            return
        end
        on_dir(vim.fs.root(bufnr, { "tsconfig.json", "jsconfig.json", "package.json", ".git" }))
    end,
    on_attach = function(_, bufnr)
        vim.api.nvim_create_autocmd({ "BufWritePost" }, {
            buffer = bufnr,
            callback = function()
                vim.cmd [[silent! !biome format --write %]]
            end,
        })
    end,
}
