{ lib, pkgs, ... }:
let
  # Import a pinned revision of nixpkgs containing opencode 1.18.21
  pkgs-pinned =
    import
      (fetchTarball {
        url = "https://github.com/NixOS/nixpkgs/archive/c27cdad491a991b11ed731760aa2ef8db0cb0410.tar.gz";
        sha256 = "1r58xn9xdka8bw710i431srl3dmy7dyrhd32rjv709f2mkb6m1ix";
      })
      {
        system = pkgs.system;
      };
in
{
  programs.opencode = {
    enable = true;

    # Temporary fix
    # Opencode 1.18.30 fails with TypeError: undefined is not an object (evaluating 'a.name')
    package = pkgs-pinned.opencode;

    settings = {
      autoupdate = false;

      permission = {
        # Workaround: "*" = "ask" overrides tools deny rules due to
        # https://github.com/anomalyco/opencode/issues/15664
        # so we explicitly set each unmentioned tool to "ask" instead.
        webfetch = lib.mkDefault "ask";
        websearch = lib.mkDefault "ask";
        codesearch = lib.mkDefault "ask";

        todoread = "allow";
        todowrite = "allow";

        read = "allow";
        glob = "allow";
        grep = "allow";
        list = "allow";

        skill = "allow";
        lsp = "allow";

        task = {
          "explore" = "allow";
        };

        edit = {
          "*" = "allow";
          ".jj" = "deny";
          ".git" = "deny";
        };

        bash = {
          "*" = "ask";

          "rg *" = "allow";
          "fd *" = "allow";
          "find *" = "allow";
          "grep *" = "allow";
          "ls *" = "allow";
          "echo *" = "allow";
          "cat *" = "allow";
          "head *" = "allow";
          "tail *" = "allow";
          "wc *" = "allow";
          "sort *" = "allow";
          "uniq *" = "allow";

          "git status *" = "allow";
          "git log *" = "allow";
          "git show *" = "allow";
          "git diff *" = "allow";
          "jj status *" = "allow";
          "jj log *" = "allow";
          "jj show *" = "allow";
          "jj diff *" = "allow";
          "jj file show *" = "allow";
          "jj bookmark list *" = "allow";
          "jj new *" = "allow";
          "jj describe *" = "allow";

          "nix flake check *" = "allow";

          "cargo check *" = "allow";
          "cargo clippy *" = "allow";
          "cargo test *" = "allow";
        };
      };
    };
  };
}
