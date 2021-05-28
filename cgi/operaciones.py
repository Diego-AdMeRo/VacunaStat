import pymongo
from datetime import datetime, timedelta
import json


class Operaciones():

    def __init__(self):
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        database = client['vacunas']
        self.collection_primeras = database['primeras']
        self.collection_segundas = database['segundas']
        self.collection_asignadas = database['asignadas']
        with open("../docs/datos.json", encoding='utf8') as archivo:
            datos = json.loads(archivo.read())
            self.diccionarios = datos["llaves"]
            self.departamentos = datos["departamentos"]  # Esto tiene en cuenta tanto el nombre como su población

    def reporteGeneral(self, fechaInicial, fechaFinal):
        diccionario_fecha_inicial_asignaciones = {}
        diccionario_fecha_final_asignaciones = {}
        rango = (fechaFinal - fechaInicial).days

        # Posible problema
        # --------------- FECHA INICIAL -------------
        for departamento in self.diccionarios:
            query = [
                {'$match': {'FECHA': {'$gte': fechaInicial, '$lt': fechaFinal}}},
                {'$group': {'_id': '$None', 'suma': {'$sum': '$'+str(departamento)}}}
            ]
            asignadas_suma_departamento = self.collection_asignadas.aggregate(query)
            for resultado in asignadas_suma_departamento:
                diccionario_fecha_inicial_asignaciones[departamento] = resultado['suma']

        # --------------- FECHA FINAL ---------------
        for departamento in self.diccionarios:
            query = [
                {'$match': {'FECHA': {'$gte': fechaInicial, '$lt': fechaFinal}}},
                {'$group': {'_id': '$None', 'suma': {'$sum': '$'+str(departamento)}}}
            ]
            asignadas_suma_departamento = self.collection_asignadas.aggregate(query)
            for resultado in asignadas_suma_departamento:
                diccionario_fecha_final_asignaciones[departamento] = resultado['suma']

        # --------------- FECHA INICIAL APLICADAS ------------
        diccionario_fecha_inicial_aplicadas = {}
        fechaInicialApli = self.obtenerFecha(fechaInicial, "primeras", "Mayor", rango)
        if fechaInicialApli is not None:
            for resultado in self.collection_primeras.find({'FECHA': fechaInicialApli}):
                for departamento in self.diccionarios:
                    diccionario_fecha_inicial_aplicadas[departamento] = resultado[departamento]
        else:
            diccionario_fecha_inicial_aplicadas["E"] = "ERROR DE FECHA"

        # --------------- FECHA FINAL APLICADAS ------------
        diccionario_fecha_final_aplicadas = {}
        fechaFinalApli = self.obtenerFecha(fechaFinal, "primeras", "Menor", rango)
        if fechaFinalApli is not None:
            for resultado in self.collection_primeras.find({'FECHA': fechaFinalApli}):
                for departamento in self.diccionarios:
                    diccionario_fecha_final_aplicadas[departamento] = resultado[departamento]
        else:
            diccionario_fecha_final_aplicadas["E"] = "ERROR DE FECHA"

        # -------------- EFICIENCIAS DE VACUNACIÓN -----------------
        efectividad_fecha_inicial = {}
        efectividad_fecha_final = {}
        efectividad_prom = {}
        efectividad_tendencia = {}
        if not ("E" in diccionario_fecha_inicial_aplicadas or "E" in diccionario_fecha_final_aplicadas):
            for departamento in self.diccionarios:
                efectividad_fecha_inicial[departamento] = 100*(diccionario_fecha_inicial_aplicadas[departamento]/diccionario_fecha_inicial_asignaciones[departamento])
                efectividad_fecha_final[departamento] = 100*(diccionario_fecha_final_aplicadas[departamento]/diccionario_fecha_final_asignaciones[departamento])
                efectividad_prom[departamento] = (efectividad_fecha_inicial[departamento]+efectividad_fecha_final[departamento])/2
                efectividad_tendencia[departamento] = efectividad_fecha_final[departamento]-efectividad_fecha_inicial[departamento]

        # --------------- SEGUNDAS DOSIS ------------
        segundas_dosis = -100000
        fechaFinalSegDosis = self.obtenerFecha(fechaFinal, "segundas", "Menor", rango)
        if fechaFinalSegDosis is not None:
            segundas_dosis = self.collection_segundas.find_one({"FECHA": fechaFinalSegDosis})["CO"]

        # ---------------- RESULTADO ----------------
        respuesta = []
        for departamento in self.diccionarios:
            if "E" in diccionario_fecha_inicial_aplicadas and "E" in diccionario_fecha_final_aplicadas:
                datos = {
                    "COD": departamento,
                    "NOM": self.departamentos[departamento]["nombre"],
                    "ASIG_INI": diccionario_fecha_inicial_asignaciones[departamento],
                    "ASIG_FIN": diccionario_fecha_final_asignaciones[departamento]
                }
            elif "E" in diccionario_fecha_inicial_aplicadas and "E" not in diccionario_fecha_final_aplicadas:
                datos = {
                    "COD": departamento, "NOM": self.departamentos[departamento]["nombre"],
                    "ASIG_INI": diccionario_fecha_inicial_asignaciones[departamento],
                    "ASIG_FIN": diccionario_fecha_final_asignaciones[departamento],
                    "APLI_FIN": diccionario_fecha_final_aplicadas[departamento]
                }
            elif "E" in diccionario_fecha_final_aplicadas and "E" not in diccionario_fecha_inicial_aplicadas:
                datos = {
                    "COD": departamento,
                    "NOM": self.departamentos[departamento]["nombre"],
                    "ASIG_INI": diccionario_fecha_inicial_asignaciones[departamento],
                    "ASIG_FIN": diccionario_fecha_final_asignaciones[departamento],
                    "APLI_INI": diccionario_fecha_inicial_aplicadas[departamento]
                }
            else:
                datos = {
                    "COD": departamento, "NOM": self.departamentos[departamento]["nombre"],
                    "ASIG_INI": diccionario_fecha_inicial_asignaciones[departamento],
                    "ASIG_FIN": diccionario_fecha_final_asignaciones[departamento],
                    "APLI_INI": diccionario_fecha_inicial_aplicadas[departamento],
                    "APLI_FIN": diccionario_fecha_final_aplicadas[departamento],
                    "EFEC_INI": self.formatoPorcentaje(efectividad_fecha_inicial[departamento]),
                    "EFEC_FIN": self.formatoPorcentaje(efectividad_fecha_final[departamento]),
                    "EFEC_PROM": self.formatoPorcentaje(efectividad_prom[departamento]),
                    "EFEC_TEND": self.formatoPorcentaje(efectividad_tendencia[departamento]),
                    "APLI_RANGO": diccionario_fecha_final_aplicadas[departamento] - diccionario_fecha_inicial_aplicadas[departamento],
                    "PORC_VAC": self.formatoPorcentaje(diccionario_fecha_final_aplicadas[departamento] / self.departamentos[departamento]["poblacion"]*100),
                    "POB": self.departamentos[departamento]["poblacion"]
                }
            if departamento == "CO":
                datos["SEG_DOSIS"] = segundas_dosis if segundas_dosis != -100000 else 0
                datos["PORC_VAC_SEG"] = self.formatoPorcentaje(segundas_dosis/self.departamentos[departamento]["poblacion"]*100)
            respuesta.append(datos)
        return respuesta

    def vacunasDiarias(self, zona, fechaInicial, fechaFinal):
        query = {"FECHA": {"$gte": fechaInicial, "$lt": fechaFinal}}
        cursor = self.collection_primeras.find(query)
        primer = self.collection_primeras.find_one({"FECHA": self.obtenerFecha(fechaInicial, "primeras", "Menor")})
        vacunas_diarias_primer_dosis = self.recorrerCursor(cursor=cursor, zona=zona, anterior=primer[zona] if primer is not None else 0)
        if zona == "CO":
            cursor = self.collection_segundas.find(query)
            primer = self.collection_segundas.find_one({"FECHA": self.obtenerFecha(fechaInicial, "segundas", "Menor")})
            vacunas_diarias_segunda_dosis = self.recorrerCursor(cursor=cursor, zona=zona, anterior=primer[zona] if primer is not None else 0)
            return (vacunas_diarias_primer_dosis, vacunas_diarias_segunda_dosis)
        return (vacunas_diarias_primer_dosis, None)

    def recorrerCursor(self, cursor, zona, anterior):
        reporte = next(cursor, None)
        resultado = []
        if reporte:
            resultado.append({"x": reporte["FECHA"].strftime('%Y-%m-%d'), "y": reporte[zona]-anterior})
            anterior = reporte
            for elemento in cursor:
                resultado.append({"x": elemento["FECHA"].strftime("%Y-%m-%d"), "y": elemento[zona] - anterior[zona]})
                anterior = elemento
        return resultado

    def obtenerFecha(self, fecha, collection, mayorMenor, rango=20):
        fechaInicial = fecha - timedelta(days=rango) if mayorMenor == "Menor" else fecha
        fechaFinal = fecha + timedelta(days=rango) if mayorMenor == "Mayor" else fecha
        sort = -1 if mayorMenor == "Menor" else 1
        query = {'FECHA': {'$gte': fechaInicial, '$lt': fechaFinal}}
        if collection == "asignadas":
            cursor = self.collection_asignadas.find(query).sort([("FECHA", sort)]).limit(1)
        elif collection == "primeras":
            cursor = self.collection_primeras.find(query).sort([("FECHA", sort)]).limit(1)
        elif collection == "segundas":
            cursor = self.collection_segundas.find(query).sort([("FECHA", sort)]).limit(1)
        resultado = next(cursor, None)
        if resultado:
            return resultado["FECHA"]
        return None

    def formatoPorcentaje(self, numero):
        decimales = 2
        return round(numero, decimales)
