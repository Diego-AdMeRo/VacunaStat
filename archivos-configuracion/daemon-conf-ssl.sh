#!/bin/bash


sudo openssl genrsa -out vacunastat.key 2048
sudo openssl req -new -key vacunastat.key  -out vacunastat.csr
sudo openssl x509 -req -days 365 -in vacunastat.csr -signkey vacunastat.key -out vacunastat.crt
