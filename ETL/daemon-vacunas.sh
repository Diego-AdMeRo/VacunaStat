#!/bin/bash

rutaETL=$(readlink -f $0 | xargs -n1 dirname)
cd $rutaETL
python3 datosVacunas.py
