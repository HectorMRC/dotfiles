SOURCE?=~/git/hectormrc/dotfiles
TARGET?=~

##########################################
# 		     Dynamic targets 			 #
##########################################
# Define default target
.DEFAULT_GOAL := all
# Exclude current, hidden and undesired directories
FIND_PATH = . -mindepth 2 
# Define the list of subdirectories that contain a Makefile
SUBDIRS := $(patsubst ./%/Makefile,%,$(shell find $(FIND_PATH) -name Makefile))
TARGETS := $(SUBDIRS)

.PHONY: all $(TARGETS) clean $(addsuffix -clean,$(TARGETS)) help

$(TARGETS):
	$(MAKE) -C $@

all: $(TARGETS)
	ln -s ${SOURCE}/.tmux.conf ${TARGET}/.

clean: $(addsuffix -clean,$(SUBDIRS))
	rm -rf ${TARGET}/.tmux.conf

$(addsuffix -clean,$(TARGETS)):
	@-$(MAKE) -C $(patsubst %-clean,%,$@) clean

##########################################
# 		     Static targets 			 #
##########################################
help:
	@echo "## Available targets:"
	@echo $(TARGETS)
	@echo "## Available clean targets:"
	@echo $(addsuffix -clean,$(TARGETS))
