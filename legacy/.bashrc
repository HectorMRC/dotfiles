#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'
PS1='[\u@\h \W]\$ '
. "$HOME/.cargo/env"

# Wasmer
export WASMER_DIR="/home/hector/.wasmer"
[ -s "$WASMER_DIR/wasmer.sh" ] && source "$WASMER_DIR/wasmer.sh"

# Bluetooth
alias bluetooth='systemctl start bluetooth'
