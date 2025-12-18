local function config()
  vim.g.base46_cache = vim.fn.stdpath "data" .. "/nvchad/base46/"
  -- load theme
  dofile(vim.g.base46_cache .. "defaults")
  dofile(vim.g.base46_cache .. "statusline")
end

return {
  "NvChad/base46",
  config = config,
  lazy = false,
}
