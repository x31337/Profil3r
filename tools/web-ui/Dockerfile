FROM python:3.10-slim

# Install system dependencies for Selenium and Chrome
RUN apt-get update && \
    apt-get install -y wget unzip curl gnupg2 && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    pip install --upgrade pip && \
    rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}') && \
    CHROMEDRIVER_VERSION=$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION%.*}) && \
    wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    rm /tmp/chromedriver.zip

# Set up app directory
WORKDIR /app
COPY modules /app/modules
COPY tools/web-ui /app/tools/web-ui

# Install Python dependencies
RUN pip install -r /app/modules/requirements.txt

WORKDIR /app/tools/web-ui
EXPOSE 5050

CMD ["gunicorn", "-b", "0.0.0.0:5050", "api:app"]
