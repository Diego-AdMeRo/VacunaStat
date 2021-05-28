# Verifica que no se dupliquen datos (resultado en todas debe ser 1)
    - `db.primeras.aggregate([{$group: {_id: "$FECHA", "resultado": {"$sum": 1}}}])`
    - `db.segundas.aggregate([{$group: {_id: "$FECHA", "resultado": {"$sum": 1}}}])`
    - `db.asignadas.aggregate([{$group: {_id: "$FECHA", "resultado": {"$sum": 1}}}])`
