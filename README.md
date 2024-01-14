# AirSense Backend

Welcome to the source code of the *AirSense* backend!

## Overview

*AirSense* is a robust and scalable solution designed to track and manage temperature, pressure, and humidity data from smart home devices. This backend system provides a centralized platform for collecting, storing, and analyzing environmental metrics, offering real-time insights into the conditions within smart homes.

## Containerized Deployment

The latest versions of the *AirSense* containers are published via *GitHub Packages*. If you want to deploy the application in a containerized environment, you can do so by using *docker compose*. However, for production deployments, we recommend using *Kubernetes* instead.

The *AirSense* backend itself is *stateless*. As a consequence, the backend is horizontally scalable. Here's an example of a deployment configuration for *docker compose*:

```yml
version: '3.8'

services:
  airsense:
    image: ghcr.io/airsense-tech/airsense-backend:latest
    container_name: airsense-backend
    environment:
      - AIR_SENSE_SECRET=****
      - AIR_SENSE_MONGO_URL=mongodb://air-mongo:27017
    networks:
      - airsense
    ports:
      - 7325:7325

  mongo:
    image: mongo:latest
    container_name: air-mongo
    volumes:
      - airsense-data:/data/db
    networks:
      - airsense
    ports:
      - 27017:27017

networks:
  airsense:
    name: airsense
    driver: bridge

volumes:
  airsense-data:
    name: airsense-data
```

You could use tools like [Kompose](https://kompose.io/) to convert *docker compose* files to *Kubernetes* configurations.

## Branches

We publish the source code for the *AirSense* backend in several branches:

- The `main` branch always contains the latest features of *AirSense*. It is not subject to as much testing as the release branches.
- The `dev` branch contains experimental features, which may be tested in an actual scenario.
- The `release` branches, usually named using the following pattern: `release/{version}`, are extensively tested and ready to use in a production environment.

## Development

### Quick Start

To start the development as fast as possible, you can use the provided development container. To be able to run the development container, you will need the following *Visual Studio Code* extension:

- `ms-vscode-remote.remote-containers`

Also, you need to have *docker* installed.

To run the container, use the *Visual Studio Code* shortcut `Ctrl+Shift+P` and select the option: `Dev Containers: Reopen in Container`.

### Setup

If you prefer not to use the development container, you will need to install the following software:

- [Node.js](https://nodejs.org/)

Furthermore, we recommend the following tools:

- [Visual Studio Code](https://code.visualstudio.com/)

Development is officially supported on the following platforms:

- *Mac*
- *Linux*
- *Windows*

Although we **recommend** working on *Linux*.

### Debugging

To debug *AirSense*, you need to make sure that all dependencies (mainly the database) are up and running. To make this process as easy as possible, we provided the `compose.deps.yml` file in the root directory of the repository. This *docker compose* file starts a *MongoDB* container.

To make development as accessible as possible, we provided a set of *Visual Studio Code* tasks to easily deploy and shutdown the local dependencies.

To deploy the local dependencies, use the following task:

```txt
Dev: Deploy Dependencies
```

To shutdown the dependencies, use:

```txt
Dev: Shutdown Dependencies
```

To debug the application, use the provided *Visual Studio Code* launch configuration. To run it, navigate to the `Run and Debug` tab or just hit `F5`.

### Local Deployment

To deploy the application locally, including all current changes, use the provided `compose.yml` file. Make sure to rebuild the *AirSense* container to include the latest changes:

```sh
docker compose up -d --build
```

To shutdown the local deployment use:

```sh
docker compose down
```

## Documentation

To be announced ...

## Contribute

To be announced ...

## License

To be announced ...
