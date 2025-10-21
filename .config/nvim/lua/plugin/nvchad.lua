local function config()
    require "options"
    require "nvchad.autocmds"
end

return {
    "NvChad/NvChad",
    branch = "v2.5",
    config = config,
    import = "nvchad.plugins",
    lazy = false,
  }
