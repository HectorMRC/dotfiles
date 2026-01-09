SOURCE:=$(dir $(abspath $(lastword $(MAKEFILE_LIST))))
CONFIG?=${HOME}/.config

all:
	ln -s \
		${SOURCE}/.bashrc \
		${SOURCE}/.bash_profile \
		${SOURCE}/.tmux.conf \
		${HOME}

	ln -s \
		${SOURCE}/alacritty \
		${SOURCE}/jj \
		${CONFIG}

	ln -s ${SOURCE}/../neovim ${CONFIG}/nvim

clean:
	rm -rf \
		${HOME}/.bashrc \
		${HOME}/.bash_profile \
		${HOME}/.tmux.conf

	rm -rf \
		${CONFIG}/alacritty \
		${CONFIG}/jj \
		${CONFIG}/nvim
