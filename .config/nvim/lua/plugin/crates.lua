return {
    'saecki/crates.nvim',
    dependencies = 'nvim-lua/plenary.nvim',
    config = function()
        require("crates").setup {
            completion = {
                cmp = {
                    enabled = true
                },
            },
            require("cmp").setup.buffer({
                sources = { { name = "crates" } }
            })
        }
    end,
    ft = "toml",
}
