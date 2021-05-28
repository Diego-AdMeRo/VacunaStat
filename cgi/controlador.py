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
            R = {"R": "S", "T": "G", "DATA": reporte.reporteGeneral(fechaInicial=fechaInicialISODate, fechaFinal=fechaFinISODate)}
            print(json.dumps(R))
        else:
            R = {"R": "E"}
            print(json.dumps(R))
    else:
        R = {"R": "E"}
        print(json.dumps(R))
elif tipoReporte == "reporte-fecha":
    fechaFin = form.getvalue("fecha")
    fechaInicial = "2021-02-16"
    if fechaFin:
        if comprobarValidezFecha(fechaFin):
            # Transformación de Fecha en formato de texto en tipo ISODate
            fechaInicialISODate = convertirFecha(fechaInicial)
            fechaFinISODate = convertirFecha(fechaFin, True)
            R = {"R": "S", "T": "G", "DATA": reporte.reporteGeneral(fechaInicial=fechaInicialISODate, fechaFinal=fechaFinISODate)}
            print(json.dumps(R))
        else:
            R = {"R": "E"}
            print(json.dumps(R))
    else:
        R = {"R": "E"}
        print(json.dumps(R))
elif tipoReporte == "reporte-departamento":
    departamento = form.getvalue("DEP")
    res = reporte.vacunasDiarias(departamento, convertirFecha(form.getvalue("fecha-inicial")), convertirFecha(form.getvalue("fecha-final"), True))
    R = {"R": "S", "T": "D", "D": departamento, "PD": res[0]}
    if res[1] is not None:
        R["SD"] = res[1]
    print(json.dumps(R))
elif tipoReporte == "departamentos":
    with open("../docs/datos.json", encoding='utf8') as archivo:
        departamentos = json.loads(archivo.read())["departamentos"]
        arregloResultado = []
        for departamento in departamentos:
            arregloResultado.append({"COD": departamento, "NOM": departamentos[departamento]["nombre"]})
        R = {"R": "S", "DEP": arregloResultado}
        print(json.dumps(R))
