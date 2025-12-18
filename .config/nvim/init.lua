vim.g.mapleader = " " -- must be done before loading Lazy

require "plugins" -- loads Lazy

vim.schedule(function()
    require "mappings"
end)

require "options"
require "lsp"
