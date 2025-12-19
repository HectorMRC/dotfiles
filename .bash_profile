#
# ~/.bash_profile
#

[[ -f ~/.bashrc ]] && . ~/.bashrc

# LaTex
export PATH=/usr/local/texlive/2024/bin/x86_64-linux:$PATH
export MANPATH=/usr/local/texlive/2024/texmf-dist/doc/man:$MANPATH
export INFOPATH=/usr/local/texlive/2024/texmf-dist/doc/info:$INFOPATH

. "$HOME/.cargo/env"

if [ -e /home/hector/.nix-profile/etc/profile.d/nix.sh ]; then . /home/hector/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
