import pymongo
import datetime


class Operaciones():
    diccionario = ["AMA", "ARA", "ANT", "ATL", "BAR", "BOG", "BOL", "CAR",
                   "BOY", "CAL", "CAQ", "CAS", "CAU", "CES", "CHO", "COR",
                   "CUN", "GUA", "GUV", "HUI", "LAG", "MAG", "STM", "MET",
                   "NAR", "NSA", "PUT", "QUI", "RIS", "SAP", "SAN", "SUC",
                   "TOL", "VAC", "BAV", "VAU", "VID", "CO"]
    nombres = {}

    collection_primeras = None

    def __init__(self):
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        database = client['vacunas']
        self.collection_primeras = database['primeras']
#        collection_segundas = database['segundas']
#        collection_asignadas = database['asignadas']

    def mapa(self):
        diccionario_fecha_inicial = {}
        diccionario_fecha_final = {}
        print('--------------- FECHA INICIAL -------------')
        for departamento in self.diccionarios:
            query = [
                {
                    '$match': {
                                  'FECHA': {
                                                '$gte': datetime.datetime(2021, 2, 16, 0, 0, 0, 0),
                                                '$lt': datetime.datetime(2021, 3, 1, 0, 0, 0, 0)
                                            }
                              }
                },
                {
                    '$group': {
                                '_id': '$None',
                                'suma': {'$sum': '$'+str(departamento)}
                              }
                }
            ]
            aplicadas_suma_departamento = self.collection_primeras.aggregate(query)
            for result in aplicadas_suma_departamento:
                diccionario_fecha_inicial[departamento] = result['suma']
                print('%s -> %d' % (departamento, result['suma']))
        print('------------- FECHA FINAL ---------------')
        for departamento in self.diccionarios:
            query = [
                {
                    '$match': {
                                  'FECHA': {
                                                '$gte': datetime.datetime(2021, 2, 16, 0, 0, 0, 0),
                                                '$lt': datetime.datetime(2021, 5, 18, 0, 0, 0, 0)
                                            }
                              }
                },
                {
                    '$group': {
                                '_id': '$None',
                                'suma': {'$sum': '$'+str(departamento)}
                              }
                }
            ]
            aplicadas_suma_departamento = self.collection_primeras.aggregate(query)
            for result in aplicadas_suma_departamento:
                diccionario_fecha_final[departamento] = result['suma']
                print('%s -> %d' % (departamento, result['suma']))

    def tablaDepartamentos(self, fechaFinal, fechaInicial=None):
        rangoFinal = self.collection_primeras.find_one({"FECHA": fechaFinal})
        tablaResultado = {}
        if fechaInicial is not None:
            rangoInicial = self.collection_primeras.find_one({"FECHA": fechaInicial})
            for departamento in self.diccionario:
                tablaResultado[departamento] = {"primeras-vacunas": rangoFinal[departamento] - rangoInicial[departamento]}
            print(tablaResultado)
            tablaResultado = dict(sorted(tablaResultado.items(), key=lambda x: x[1]["primeras-vacunas"], reverse=True))
            print(tablaResultado)
        else:
            for departamento in self.diccionario:
                tablaResultado[departamento] = {"primeras-vacunas": rangoFinal[departamento]}
            print(tablaResultado)
            tablaResultado = dict(sorted(tablaResultado.items(), key=lambda x: x[1]["primeras-vacunas"], reverse=True))


def convertirFecha(fecha):
    return datetime.datetime.strptime(fecha, "%Y-%m-%d")


if __name__ == "__main__":
    m = Operaciones()
    m.tablaDepartamentos(fechaInicial=convertirFecha("2021-03-01"), fechaFinal=convertirFecha("2021-05-18"))
