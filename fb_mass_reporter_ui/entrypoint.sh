#!/bin/sh

# Start Xvfb in the background on display :99
echo "Starting Xvfb on display ${DISPLAY}"
Xvfb ${DISPLAY} -screen 0 1280x1024x24 -nolisten tcp &
xvfb_pid=$!

# Wait a bit for Xvfb to start
sleep 2

echo "Xvfb started with PID $xvfb_pid"

# Execute the command passed to the entrypoint (e.g., "flask run")
echo "Executing command: $@"
exec "$@"

# Optional: cleanup Xvfb when the main command exits, though exec replaces the script process
# trap "echo 'Stopping Xvfb'; kill $xvfb_pid; exit" SIGINT SIGTERM
# wait $xvfb_pid # This would only be reached if exec wasn't used, or if the command finishes quickly.
# With `exec`, the script's process is replaced by the CMD's process.
# If CMD (flask run) terminates, the container stops, and Xvfb along with it.
