## Running this repo:

This repo can be run in Docker or directly with Node. The intended use is with Docker since the project uses a MQTT server that is local. Docker will host a MQTT server without the user needing to install an MQTT server. I will explain how to install with Docker First, Then a bare metal Linux system(Ubuntu in this example). Other operating systems may require different package managers to install and run this repo.

### Running with Docker

To run with Docker cd into the repo, then run:

`docker-compose up -d --build`

and to remove:
`docker-compose down`

### Running on Linux

Node version used for this project:

`v20.19.*`

Installation:

Run the following to install an MQTT server:
`sudo apt install mosquitto`

The server should now be running, but if it isnt you may need to run:
```
sudo systemctl enable mosquitto.service
sudo systemctl start mosquitto.service
```

This will let you know if the server is running:
`sudo systemctl status mosquitto.service`

##### Run The Server
`npm install && npm run postinstall` at the root

`npm run start` 

Your server should now be running. 

Visit: http://localhost:3001
Visit: http://localhost:5173

