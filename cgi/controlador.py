#!/usr/bin/python3

import cgi
import cgitb
import json
import datetime
from operaciones import Operaciones


def comprobarValidezFecha(fecha):
    partesFecha = fecha.split("-")
    if len(partesFecha) == 3:
        for parteFecha in partesFecha:
            if not parteFecha.isdigit():
                return False
        return True
    else:
        return False


def convertirFecha(fecha, final=False):
    if not final:
        return datetime.datetime.strptime(fecha, "%Y-%m-%d")
    else:
        return datetime.datetime.strptime(f"{fecha}T10:00:00.000Z", "%Y-%m-%dT%H:%M:%S.%fZ")


def obtenerJson(ruta):
    with open(ruta, encoding='utf8') as archivo:
        return json.loads(archivo.read())


def guardarJson(ruta, datos):
    with open(ruta, 'w') as archivo:
        json.dump(datos, archivo)


cgitb.enable(display=0)
form = cgi.FieldStorage()
tipoReporte = form.getvalue("reporte")
reporte = Operaciones()

print("Content-type: application/json\n\n")


if tipoReporte == "reporte-rango":
    fechaInicial = form.getvalue("fecha-inicial")
    fechaFin = form.getvalue("fecha-final")
    if fechaInicial and fechaFin:
        if comprobarValidezFecha(fechaInicial) and comprobarValidezFecha(fechaFin):
            # Transformación de Fecha en formato de texto en tipo ISODate
            fechaInicialISODate = convertirFecha(fechaInicial)
            fechaFinISODate = convertirFecha(fechaFin, True)
            if fechaInicialISODate <= fechaFinISODate:
                R = {"R": "S", "T": "G", "D": reporte.reporteGeneral(fechaInicial=fechaInicialISODate, fechaFinal=fechaFinISODate)}
            else:
                R = {"R": "E", "T": "PF"}  # Error problema fechainicial mayor a fechafin
        else:
            R = {"R": "E", "T": "EV"}  # Error de validez de fechas
    else:
        R = {"R": "E", "T": "EC"}  # Error de existencia de fechas
    print(json.dumps(R))
elif tipoReporte == "reporte-fecha":
    fechaFin = form.getvalue("fecha")
    fechaInicial = "2021-02-16"
    if fechaFin:
        if comprobarValidezFecha(fechaFin):
            # Transformación de Fecha en formato de texto en tipo ISODate
            fechaInicialISODate = convertirFecha(fechaInicial)
            fechaFinISODate = convertirFecha(fechaFin, True)
            if fechaInicialISODate <= fechaFinISODate:
                R = {"R": "S", "T": "G", "D": reporte.reporteGeneral(fechaInicial=fechaInicialISODate, fechaFinal=fechaFinISODate)}
            else:
                R = {"R": "E", "T": "PF"}  # Error problema fechainicial mayor a fechafin
        else:
            R = {"R": "E", "T": "EV"}  # Error de validez de fechas
    else:
        R = {"R": "E"}
    print(json.dumps(R))
elif tipoReporte == "reporte-departamento":
    departamento = form.getvalue("DEP")
    departamentos = obtenerJson("../docs/datos.json")["departamentos"]
    if departamento in departamentos:
        fechaInicialISODate = convertirFecha(form.getvalue("fecha-inicial"))
        fechaFinISODate = convertirFecha(form.getvalue("fecha-final"), True)
        if fechaInicialISODate <= fechaFinISODate:
            res = reporte.vacunasDiarias(departamento, fechaInicialISODate, fechaFinISODate)
            R = {"R": "S", "T": "D", "D": departamento, "PD": res[0]}
            if res[1] is not None:
                R["SD"] = res[1]
        else:
            R = {"R": "E", "T": "PF"}  # Error problema fechainicial mayor a fechafin
    else:
        R = {"R": "E", "T": "DE"}  # Error de departamento
    print(json.dumps(R))
elif tipoReporte == "departamentos":
    departamentos = obtenerJson("../docs/datos.json")["departamentos"]
    arregloResultado = []
    for departamento in departamentos:
        arregloResultado.append({"COD": departamento, "NOM": departamentos[departamento]["nombre"]})
    visitas = obtenerJson("../docs/visitas.json")
    visitas["visitas"] += 1
    guardarJson("../docs/visitas.json", visitas)
    R = {"R": "S", "DEP": arregloResultado, "V": visitas["visitas"]}
    print(json.dumps(R))
else:
    R = {"R": "E", "T": "PI"}  # Error de Petición
