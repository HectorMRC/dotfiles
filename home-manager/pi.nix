{ config, osConfig, ... }:
let
  cfg = config.programs.pi-coding-agent;
  whenTags = import ../lib/whenAll.nix osConfig.deployment.tags;

  mcp = {
    mcpServers.linear = {
      url = "https://mcp.linear.app/mcp";
      description = "Linear issues, projects, teams and workflow statuses";
    };
  };
  colors = config.palette.colors;

  # Every color is derived from the palette; nothing is inherited from pi's
  # built-in themes.
  theme = {
    "$schema" =
      "https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/src/modes/interactive/theme/theme-schema.json";
    name = "palette";

    vars = {
      primary = colors.primary;
      secondary = colors.secondary;
      sunken = colors.sunken;
      background = colors.background;
      surface = colors.surface;
      foreground = colors.foreground;
      foregroundMuted = colors.foreground-muted;
      foregroundDisabled = colors.foreground-disabled;
      border = colors.border;
      success = colors.success;
      warning = colors.warning;
      error = colors.error;
      info = colors.info;
      accent = colors.accent;
    };

    colors = {
      # Core UI
      accent = "accent";
      border = "border";
      borderAccent = "primary";
      borderMuted = "border";
      success = "success";
      error = "error";
      warning = "warning";
      muted = "foregroundMuted";
      dim = "foregroundDisabled";
      text = "foreground";
      thinkingText = "foregroundMuted";

      # Backgrounds & content
      selectedBg = "surface";
      scrollbarTrack = "surface";
      scrollbarThumb = "foregroundDisabled";
      searchMatchBg = "border";
      searchMatchText = "foreground";
      userMessageBg = "surface";
      userMessageText = "foreground";
      customMessageBg = "surface";
      customMessageText = "foreground";
      customMessageLabel = "accent";
      toolPendingBg = "sunken";
      toolSuccessBg = "sunken";
      toolErrorBg = "sunken";
      toolTitle = "foreground";
      toolOutput = "foregroundMuted";

      # Markdown
      mdHeading = "primary";
      mdLink = "info";
      mdLinkUrl = "foregroundDisabled";
      mdCode = "accent";
      mdCodeBlock = "secondary";
      mdCodeBlockBorder = "foregroundDisabled";
      mdQuote = "foregroundMuted";
      mdQuoteBorder = "foregroundDisabled";
      mdHr = "foregroundDisabled";
      mdListBullet = "primary";

      # Diffs
      toolDiffAdded = "success";
      toolDiffRemoved = "error";
      toolDiffContext = "foregroundMuted";

      # Syntax highlighting
      syntaxComment = "foregroundDisabled";
      syntaxKeyword = "error";
      syntaxFunction = "success";
      syntaxVariable = "info";
      syntaxString = "success";
      syntaxNumber = "accent";
      syntaxType = "warning";
      syntaxOperator = "primary";
      syntaxPunctuation = "foregroundMuted";

      # Thinking level borders
      thinkingOff = "border";
      thinkingMinimal = "foregroundDisabled";
      thinkingLow = "info";
      thinkingMedium = "success";
      thinkingHigh = "warning";
      thinkingXhigh = "primary";
      thinkingMax = "error";

      # Modes
      bashMode = "success";
    };

    # /export HTML output
    export = {
      pageBg = colors.sunken;
      cardBg = colors.background;
      infoBg = colors.surface;
    };
  };
in
{
  programs.pi-coding-agent = {
    enable = true;
    context = ../pi/AGENTS.md;

    settings = {
      defaultProvider = "anthropic";
      theme = theme.name;
      hideThinkingBlock = true;
      defaultTools = [
        "read"
        "bash"
        "edit"
        "write"
        "grep"
        "find"
        "ls"
      ];
    };
  };

  home.file = {
    "${cfg.configDir}/extensions" = {
      source = ../pi/extensions;
      recursive = true;
    };
    "${cfg.configDir}/themes/${theme.name}.json".text = builtins.toJSON theme;
  }
  // whenTags [ "work" ] {
    "${cfg.configDir}/skills" = {
      source = ../pi/skills;
      recursive = true;
    };
    "${cfg.configDir}/mcp.json".text = builtins.toJSON mcp;
  };
}
