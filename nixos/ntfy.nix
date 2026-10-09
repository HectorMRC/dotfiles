# Push notifications via ntfy. Import from any module that needs them.
{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.ntfy.send = lib.mkOption {
    type = lib.types.package;
    readOnly = true;
    description = "Script `ntfy-send <title> <priority> <tags>`; reads the body from stdin.";
  };

  config = {
    age.secrets.ntfy-url.file = ../secrets/ntfy-url.age;

    ntfy.send = pkgs.writeShellApplication {
      name = "ntfy-send";
      runtimeInputs = [ pkgs.curl ];

      text = ''
        if [ $# -ne 3 ]; then
          echo "usage: ntfy-send <title> <priority> <tags>" >&2
          exit 2
        fi

        curl -fsS --max-time 10 \
          -H "Title: $1" \
          -H "Priority: $2" \
          -H "Tags: $3" \
          --data-binary @- \
          "$(<${config.age.secrets.ntfy-url.path})"
      '';
    };
  };
}
