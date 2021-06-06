# VacunaStat

## Descripción

Aplicativo web enfocado en la representación gráfica y dinámica del proceso de vacunación contra el COVID-19 en Colombia, el cual toma la información de un documento externo disponible [online](https://docs.google.com/spreadsheets/d/1z2KYfMvDMLHb3f1xQMDHM5Q9ll_vIwe764XBBQF7P2E/edit#gid=0) basado en las infografías y asignaciones realizadas por el gobierno. Siendo su objetivo principal aportar a la información de libre acceso y conocimiento de la situación del país respecto a la vacunación para la fácil obtención, análisis y aprendizaje.

Las características principales del proyecto son: representación departamental mediante gráficos interactivos (mapa, burbujas, gauge y de líneas) a partir del procesado, limpieza y segmentación de los datos suministrados.

## Distribución

El aplicativo se encuentra dividido en tres apartados principales:

1. **ETL**

   La ETL por sus iniciales "Extract, Transform and Load" se encarga de tomar los datos almacenados en un documento externo al aplicativo, procesarlos respecto al diseño de la base de datos y cargarlos para el fácil y rápido procesamiento

2. **Frontend**

   El Frontend son todas las carpetas, imágenes y archivos (HTML, CSS y JS) entregados al cliente para su representación por los buscadores compatibles con los componentes utilizados.

3. **Backend**

   Finalmente, el Backend hace referencia a la carpeta CGI y scripts Python que son ejecutados por el servidor Apache, específicamente el _controlador.py_ se encarga de tomar las peticiones provenientes de los clientes, analizar el contenido y redirigirlo a los métodos disponibles en script _operaciones.py_ el cual genera una conexión con la base de datos, trae los datos, los procesa, les da formato según las respuestas establecidas, y los retorna para que el controlador responda el contenido en formato JSON.

## Instalación
La instalación de los recursos, librerías y/o dependencias se encuentra sujeto a la distribución del sistema operativo utilizado, en este caso la presentada a continuación fue realizada en **Ubuntu 20.04.2 LTS**.

### Configuración de Entorno

El aplicativo fue diseñado e implementado para funcionar en conjunto con el servidor Apache y base de datos MongoDB, por lo cual se requiere de su existencia en el sistema.

- Instalación de apache:

  ```console
  sudo apt install apache2
  ```

  Además de esto debe habilitar el módulo de CGI y permitir la ejecución de scripts Python

- Instalación de MongoDB
  ```console
  sudo apt install -y mongodb
  ```
  Inicialización del servicio
  ```console
  sudo systemctl start mongod.service
  ```
  Así mismo se requiere la creación de la base de datos y las respectivas Collections
  ```javascript
  use vacunas;
  db.createCollection("asignadas");
  db.createCollection("primeras");
  db.createCollection("segundas");
  ```

En caso de tener un firewall en el sistema, por favor verifique y habilite los puertos de acceso necesarios para el correcto funcionamiento del aplicativo:

- MongoDB puerto 27017
- Apache puertos 80 y 443

Por otro lado, si desea asignarle un dominio a la herramienta, favor remitirse a la documentación formal del aplicativo. Finalmente, compruebe el estado de los servicios

```console
sudo systemctl status apache2
```

```console
sudo systemctl status mongod
```

### Configuración de Despliegue

1. Teniendo en cuenta que el aplicativo requiere de la actualización constante de los datos de vacunación, se debe tener instaladas las siguientes dependencias de Python:
   - Librerías necesarias para la extracción de datos de documento Google Sheets
   ```console
   pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```
   - Librería necesaria para la conectividad con la base de datos NoSQL MongoDB
   ```console
   pip3 install pymongo
   ```
2. Copie el repositorio en el directorio _/var/www/html_ y luego diríjase a _/etc/apache2/sites-available/_ para configurar el virtual host de despliegue, si desea utilizar disponible por default (_000-default.conf_) asigne las siguientes propiedades:
   ```console
   ServerName VacunaStat
   ServerAdmin VacunaStat
   DocumentRoot /var/www/html/VacunaStat
   ```
   Por otro lado, en caso de querer validar su sitio web con un certificado SSL, remítase a la documentación formal del aplicativo.
   
3. Comprobar configuración de cambios del servidor Apache y su reinicio:
   ``` console
   sudo apachectl configtest
   sudo systemctl restart apache2.service
   ```
   
3. Finalmente, correr el archivo _daemon-vacunas.sh_ y para obtener actualización de los datos agregarlo a la ejecución programada del sistema mediante el servicio crontab del usurario root:
   ```console
   sudo crontab -u root -e
   ```
   y añadir:
   ```console
   00 00 * * * /var/www/html/vacstat/ETL/daemon-vacunas.sh >> /var/www/html/vacstat/ETL/docs/datos-vacunas.log 2>&1
   ```

## Construida con:

- Python v3.8.5
- JavaScript
- Bootstrap v5
- MongoDB

## Dependencias:

- Frontend
  - MapBox GL v1.9.1
  - Chart.js v2.7.3
  - Chart.js datalabels v0.2.0
  - C3 v5
- Backend
  - pyMongo
  - google-api-python-client
  - google-auth-httplib2
  - google-auth-oauthlib

## Autores

- [Brandon Alexander Rodríguez Caro](https://github.com/BrandonRodriguezC)
- [Diego Adrián Meneses Romero](https://github.com/Diego-AdMeRo)

## Datos Tomados y actualizados por:

- [Igor Támara y Pilar Saenz](https://docs.google.com/spreadsheets/d/1z2KYfMvDMLHb3f1xQMDHM5Q9ll_vIwe764XBBQF7P2E/edit#gid=0)
