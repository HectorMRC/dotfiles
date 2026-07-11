return {
    "obsidian-nvim/obsidian.nvim",
    version = "*",
    ---@module 'obsidian'
    ---@type obsidian.config
    opts = {
        legacy_commands = false,
        workspaces = {
            {
                name = "Mai fou llum",
                path = "~/git/hectormrc/docs/Mai fou llum/"
            },
        },
    },
}
