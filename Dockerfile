# Use the official Python image from the Docker Hub
FROM python:latest

RUN pip3 install docopt numpy flask sqlalchemy

WORKDIR /app

# Expose port 5000 to allow access to the application
EXPOSE 5000

