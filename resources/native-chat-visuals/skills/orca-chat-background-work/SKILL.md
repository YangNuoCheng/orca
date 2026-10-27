---
name: orca-chat-background-work
description: Keep long-running work visible in this Orca chat. Use before starting anything that should keep running after your reply, such as a training run, a benchmark sweep, or a job on a remote server over ssh, and when the user asks whether that work is still running.
user-invocable: false
---

# Long-running work in an Orca chat

Orca shows a chat as monitoring, and lists its background work under the chat, while a background command you started is still running. When the last one ends, the chat shows done and the user is notified. Work that you detach from yourself (`nohup`, `setsid`, `&`, `disown`, `tmux`, `screen`, or a job started over `ssh` that outlives the ssh command) is invisible to Orca: the chat shows done while it runs, and nobody learns when it dies.

## Starting work

- If the work can run as one of your own background commands (your harness's background terminal or background shell), start it that way. Orca then tracks it directly.
- If it has to be detached (it must survive a restart, or it runs on another machine), start it, then start a watcher as one of your own background commands. The watcher lives exactly as long as the work, so Orca tracks the work through it:

  ```text
  # on this machine
  while kill -0 PID 2>/dev/null; do sleep 30; done; tail -n 20 LOG

  # on a server
  ssh -o ServerAliveInterval=30 HOST 'while kill -0 PID 2>/dev/null; do sleep 30; done; tail -n 20 LOG'
  ```

  Use the process id of the work itself, not of a launcher that has already exited. Print it from the command that starts the work (`... & echo $!`). `pgrep -f` run through `ssh` can match the remote shell running that same `pgrep`, so if you search for the id, exclude your own command, and check that the watcher does not exit at once.

- Before saying the work started, check it: the process exists and its log is growing. A launch command that printed nothing wrong is not proof. If the check fails, say so and fix it.

## Reporting

- When the user asks how the work is going, look before answering: is the process alive, when did the log last change, and what does its last line say. Report what you saw, including "no new output for N minutes".
- When the watcher ends, the work has ended. Read the end of the log and say whether it finished or failed. If the watcher ended because the connection dropped (ssh errors), check the host again before reporting that the work stopped.
