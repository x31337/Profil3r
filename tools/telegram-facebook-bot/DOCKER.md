# Docker Usage for Telegram-Facebook-Bot

## Building the Docker Image

```bash
docker build -t telegram-facebook-bot .
```

## Running the Container

Before running the container, make sure you have your configuration files ready:

1. `FB_Bot.ini` - Main configuration file
2. `FB_pages.csv` - List of Facebook pages to monitor
3. Any other configuration files needed

### Run with configuration files mounted:

```bash
docker run -v /path/to/your/config:/app/config telegram-facebook-bot
```

### Run with environment variables:

```bash
docker run -e BOT_TOKEN=your_bot_token telegram-facebook-bot
```

## Configuration

The bot requires proper configuration files to function. See the main README.md for configuration
details.

## Notes

- The container runs as a non-root user for security
- Firefox and GeckoDriver are included for web scraping
- No ports are exposed as this bot doesn't serve web content
- All logs are written to the container filesystem

## Troubleshooting

If you encounter issues:

1. Check that your configuration files are properly mounted
2. Verify your Telegram bot token is correct
3. Ensure the Facebook pages you're monitoring are accessible
4. Check container logs: `docker logs <container_id>`
