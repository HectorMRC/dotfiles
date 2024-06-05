SOURCE?=~/git/hectormrc/dotfiles/.config/
TARGET?=~/.config/

all:
	@echo "Linking config files from ${SOURCE} to ${TARGET}"
	@ln -s ${SOURCE}/nvim ${TARGET}
	@ln -s ${SOURCE}/alacrity ${TARGET}

clean:
	@echo "Removing config files from ${SOURCE} at ${TARGET}"
	@rm -rf ${TARGET}/nvim ${TARGET}/alacrity
