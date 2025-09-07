# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for PostgreSQL and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and group
RUN useradd -m -u 1000 mcpuser

# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/data && \
    chown -R mcpuser:mcpuser /app

# Copy the rest of the application code
COPY --chown=mcpuser:mcpuser . .

# Switch to the non-root user
USER mcpuser

# Expose the port the MCP server runs on
EXPOSE 3000

# Command to run the MCP server
CMD ["python", "server.py"]
