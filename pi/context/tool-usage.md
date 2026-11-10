# Tool usage

- There is no shell.
    When no tool covers a task, ask the user to run the command.
- Make independent tool calls in parallel.
- Never inspect a known file or one already in context with anything but `read`.
- Stay in the working directory and use paths relative to it.
