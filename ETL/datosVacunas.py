#!/usr/bin/python3

from sheets import conexionSheets
import pymongo
import json
import datetime
import sys
#from correo import Correo


def esNumero(palabra):
    try:
        return int(palabra.strip())
    except (ValueError, TypeError):
        return 0


def cargarJSON(ruta):
    with open(ruta, encoding='utf8') as archivo:
        return json.loads(archivo.read())


def guardarJSON(ruta, datos):
    with open(ruta, encoding='utf8', mode='w') as archivo:
        json.dump(datos, archivo, ensure_ascii=False)


def obtenerFecha():
    fecha = datetime.datetime.now()
    return f"{fecha.year}/{fecha.month}/{fecha.day} {fecha.hour}:{fecha.minute}:{fecha.second}"


def anadirLog(mensaje):
    with open("./docs/datos-vacunas.log", "a+") as log:
        log.write(f"{obtenerFecha()} - {mensaje}\n")


def main():
    configuracion = cargarJSON("./docs/configuracion.json")
    conexion = conexionSheets("./docs/token.json", "./docs/credentials.json")
    sheet = conexion.spreadsheets()
    #correo = Correo()
    mensaje = ""

    result = sheet.values().get(
        spreadsheetId="1z2KYfMvDMLHb3f1xQMDHM5Q9ll_vIwe764XBBQF7P2E",
        range=f"Originales!A{configuracion['indice vacunas']}:AQ").execute()
    datos = result.get('values', [])

    if not datos:
        mensaje = "No se han encontrado datos"
        anadirLog(mensaje)
        #correo.enviarCorreo(mensaje)
    else:
        try:
            myclient = pymongo.MongoClient("mongodb://localhost:27017/")
            mydb = myclient["vacunas"]
            diccionarios = ["AMA", "ANT", "ARA", "ATL", "BAR", "BOG", "BOL", "CAR", "BOY", "CAL", "CAQ", "CAS", "CAU", "CES", "CHO", "COR", "CUN", "GUA",
                            "GUV", "HUI", "LAG", "MAG", "STM", "MET", "NAR", "NSA", "PUT", "QUI", "RIS", "SAP", "SAN", "SUC", "TOL", "VAC", "BAV", "VAU", "VID", "CO"]
            nuevoIndex = configuracion["indice vacunas"]
            for fila in datos:
                auxDic = {}
                anterior = diccionarios[0]
                if len(fila) == 43:
                    nuevoIndex += 1
                    fecha = datetime.datetime.strptime(fila[0], "%Y-%m-%d")
                    if fila[2].strip() == "-1":  # Primera Dosis
                        for index, diccionario in enumerate(diccionarios, start=5):
                            if index == 9 or index == 12 or index == 27 or index == 39:
                                auxDic[anterior] = auxDic[anterior] + esNumero(fila[index])
                            else:
                                auxDic[diccionario] = esNumero(fila[index])
                            anterior = diccionario
                        # auxDic["FECHA"] = fila[0]
                        auxDic["FECHA"] = fecha
                        mycol = mydb["primeras"]
                        mycol.insert_one(auxDic)
                    elif fila[2].strip() == "1":  # Asignación
                        for index, diccionario in enumerate(diccionarios, start=5):
                            if index == 9 or index == 12 or index == 27 or index == 39:
                                auxDic[anterior] = auxDic[anterior] + esNumero(fila[index])
                            else:
                                auxDic[diccionario] = esNumero(fila[index])
                            anterior = diccionario
                        auxDic["TIPO_VACUNA"] = fila[1]
                        # auxDic["FECHA"] = fila[0]
                        auxDic["FECHA"] = fecha
                        mycol = mydb["asignadas"]
                        mycol.insert_one(auxDic)
                    elif fila[2].strip() == "2":  # Segunda Dosis
                        auxDic[diccionarios[-1]] = esNumero(fila[42])
                        # auxDic["FECHA"] = fila[0]
                        auxDic["FECHA"] = fecha
                        mycol = mydb["segundas"]
                        mycol.insert_one(auxDic)
            configuracion["indice vacunas"] = nuevoIndex
            guardarJSON("./docs/configuracion.json", configuracion)
            mensaje = "Nuevos Datos Agregados"
            anadirLog(mensaje)
            #correo.enviarCorreo(mensaje)
        except:
            mensaje = f"Error al Agregar Nuevos Datos {sys.exc_info()[0]}"
            anadirLog(mensaje)
            #correo.enviarCorreo(mensaje)
            print("Error al cargar los datos")


if __name__ == '__main__':
    main()
