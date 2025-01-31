# Sequenial Command

Many commands into one command for VSCode.

## Original

- [sequential-command.el](https://github.com/rubikitch/sequential-command): Many commands into one command

## Usage

Combine multiple commands into one command by setting up a command list in `sequential-command.definitions.(A to Z)`.

The command list defined in `sequential-command.definitions.A` can be executed in sequence as `sequential-command.executeA` command.

For example, if `sequential-command.definitions.A` is defined as follows, each time `sequential-command.executeA` is executed, `cursorLineStart` -> `cursotTop` -> `sequential-command.seqReturn` -> `cursorLineStart` ... are executed in sequence.

```json
{
  "sequential-command.definitions": {
    "A": [
      "cursorLineStart",
      "cursorTop",
      "sequential-command.seqReturn"
    ],

[...]

}
```

## Difference from sequential-command.el (workaround)

VSCode does not provide a way to determine if a command is being executed continuously (there is no `onDidExecuteCommand`).

Therefore, this extension clears the determination of sequential execution when `sequential-command.execute*` is not executed for a certain period of time (`sequential-command.sequenceTimeout`).

If there is a way to resolve this, please let me know.
