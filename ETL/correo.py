#!/usr/bin/python3
# -*- coding: utf-8 -*-

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json


class Correo():

    def __init__(self):
        with open("./docs/credenciales.json", encoding='utf8') as archivo:
            self.__credenciales = json.loads(archivo.read())

    def enviarCorreo(self, mensaje):
        correos = ["diego-meneses@upc.edu.co", "brandon-rodriguez3@upc.edu.co"]
        correo = MIMEMultipart()
        correo['From'] = self.__credenciales["correo"]
        correo['To'] = ", ".join(correos)
        correo['Subject'] = 'Mensaje Vacstat'
        correo.attach(MIMEText(f'''<html>
            <body>
                <p>{mensaje}</p>
            </body>
        </html>''', "html", "utf-8"))
        conexion = smtplib.SMTP('smtp.gmail.com:587')
        conexion.starttls()
        conexion.login(
            self.__credenciales["correo"], self.__credenciales["contraseña"])
        conexion.sendmail(correo['From'], correos, correo.as_string())
        conexion.quit()
