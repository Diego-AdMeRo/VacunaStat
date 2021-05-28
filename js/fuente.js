var mapa, medidorGauge, graficaBurbujas, graficaLinea;

window.onload = function () {
        //-------------- Asignar Fecha Actual en los datepicker -----------------------
        // Se puede optimizar más al tomar la fecha maxima de los reportes
        fechasActuales = document.getElementsByClassName("fechaActual");
        hoy = new Date();
        for (fechaActual of fechasActuales) {
                fechaActual.valueAsDate = hoy;
                fechaActual.setAttribute("max", fechaActual.value);
        }
        //------------------------------- Mapbox --------------------------------------
        mapa = crearMapa("mapa");
        //---------------------------- Medidor Gauge ----------------------------------
        medidorGauge = crearMedidorGauge("#gauge");
        //------------------------- Gráfica de Burbujas -------------------------------
        graficaBurbujas = crearGraficaDeBurbujas("burbujas");
        //------------------------- Gráfica de Líneas ---------------------------------
        graficaLinea = crearGraficaLinea("vacunasReporte");
        //--------------------- Asignación de Eventos Forms ---------------------------
        asignarAccionesForm("reporte-rango");
        asignarAccionesForm("reporte-dia");
        asignarAccionesForm("reporte-diario-departamento");

        //-------------------------- Cargado de Reporte -------------------------------
        cargarDepartamentos();
        solicitarReporte(document.getElementById("reporte-rango"));
        var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
        });
        mapa.on('mousemove', function (e) {
                var features = mapa.queryRenderedFeatures(e.point);
                var displayProperties = [
                        'type',
                        'properties',
                        'id',
                        'layer',
                        'source',
                        'sourceLayer',
                        'state'
                        ];
                var displayFeatures = features.map(function (feat) {
                        var displayFeat = {};
                        displayProperties.forEach(function (prop) {
                                displayFeat[prop] = feat[prop];
                        });
                        return displayFeat;
                });
                var verificacion ='No esta en capa\n'+e.lngLat.lng+'\n'+e.lngLat.lat+'\n';
                //try{  
                if(typeof displayFeatures[0]  !== 'undefined'){
                        if(displayFeatures[0].hasOwnProperty("properties")){
                                if(displayFeatures[0].properties.pais == 'Colombia' || displayFeatures[0].properties.iso_3166_1=='CO'){
                                        mapa.getCanvas().style.cursor = 'pointer';
                                        verificacion = 'Esta en capa\n'+e.lngLat.lng+'\n'+e.lngLat.lat+'\n';
                                        popup.setLngLat(e.lngLat).setHTML('<strong>Testing</strong>\n<p><b>Departamento: </b>'+displayFeatures[0].properties.departamento+'<p>').addTo(mapa);
                                }else{
                                        mapa.getCanvas().style.cursor = '';
                                        popup.remove();
                                }
                        }
                }
                //}catch (error){
                //        console.log(error);
                //}
                var info = JSON.stringify(displayFeatures,null,2);
                document.getElementById('features').innerHTML =verificacion +'\n'+ info;
        });
};

//---------------------------- Acciones con el Servidor ------------------------
function asignarAccionesForm(formId) {
        const form = document.getElementById(formId);
        form.addEventListener("submit", function (event) {
                event.preventDefault();
                solicitarReporte(form);
        });
};

function agregarCarga(elemento) {
        const boton = elemento.querySelector('[type="submit"]');
        let cargando = document.createElement("SPAN");
        cargando.classList.add("spinner-border", "spinner-border-sm", "mx-1");
        boton.firstElementChild.insertBefore(cargando, boton.firstElementChild.firstChild);
        boton.disabled = true;
};

function eliminarCarga(elemento) {
        const boton = elemento.querySelector('[type="submit"]');
        boton.firstElementChild.removeChild(boton.firstElementChild.firstChild);
        boton.disabled = false;
};

function mensajeError(infoError) {
        const menu = document.getElementById("menu__reporte");
        const mensaje = document.createElement("DIV");
        mensaje.classList.add(
                "alert",
                "alert-danger",
                "d-flex",
                "align-items-center",
                "col-sm-12"
        );
        mensaje.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16"> 
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /> 
        </svg>
        <div class="flex-fill mx-2">
                ${infoError}
        </div> 
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
        menu.appendChild(mensaje);
};

//-------------------------Formato numerico de los datos---------------------------

function formatoNumero(numero){
        return new Intl.NumberFormat("es-CO").format(numero);
};

function actualizarCards(datos){
        //Dosis Asignadas, Efectividad, Dosis Aplicadas, Primeras Dosis, Segundas Dosis
        document.getElementById("card_dosis_asignadas").textContent = formatoNumero(datos.ASIG_FIN);
        document.getElementById("card_efectividad").textContent = `${formatoNumero(datos.EFEC_FIN)} %`;
        document.getElementById("card_dosis_aplicadas").textContent = formatoNumero(datos.APLI_FIN);
        document.getElementById("card_primer_dosis").textContent = formatoNumero(datos.APLI_FIN);
        document.getElementById("card_segundas_dosis").textContent = formatoNumero(datos.SEG_DOSIS);
};

function actualizarTabla(datos){
        let tabla = document.getElementById("tabla_departamentos").lastElementChild;
        tabla.innerHTML = "";
        let filas = document.createDocumentFragment();
        let index = 1;
        for(dato of datos){
                let fila = document.createElement("TR");
                let numero = document.createElement("TH");
                let nombreDepartamento = document.createElement("TD");
                let poblacion = document.createElement("TD");
                let vacunados = document.createElement("TD");
                let porcVacunados = document.createElement("TD");

                numero.scope = "row";
                numero.textContent = index;
                fila.appendChild(numero);

                nombreDepartamento.textContent = dato.NOM;
                fila.appendChild(nombreDepartamento);

                poblacion.textContent = formatoNumero(dato.POB);
                poblacion.classList.add("text-end");
                fila.appendChild(poblacion);

                vacunados.textContent = formatoNumero(dato.APLI_FIN);
                vacunados.classList.add("text-end");
                fila.appendChild(vacunados);

                porcVacunados.textContent = `${formatoNumero(dato.PORC_VAC)} %`;
                porcVacunados.classList.add("text-end");
                fila.appendChild(porcVacunados);

                if(dato.COD === "CO"){
                        nombreDepartamento.classList.add("fw-bold");
                        poblacion.classList.add("fw-bold");
                        vacunados.classList.add("fw-bold");
                        porcVacunados.classList.add("fw-bold");
                }

                filas.appendChild(fila);
                index+=1;
        }
        tabla.appendChild(filas);
};

function actualizarGauge(datos){
        medidorGauge.load({
                unload: true,
                columns: [
                        [`% vacunados primer dosis`, datos.PORC_VAC],
                        [`% vacunados segunda dosis`, datos.PORC_VAC_SEG],
                        [`Inmunidad por Revaño en Colombia`, 70]           
                ],
        });
};

function actualizarGraficoBurbujas(datos){
        while(graficaBurbujas.data.datasets.length !== 0){
                 graficaBurbujas.data.datasets.pop();
        }
        graficaBurbujas.data.labels = [];
        for (departamento of datos){
                if(departamento.COD !== "CO"){
                graficaBurbujas.data.datasets.push({
                        label: departamento.NOM, 
                        data: [{x: departamento.EFEC_FIN, y: departamento.APLI_FIN / 10000, r: departamento.APLI_FIN / 100000}], 
                        backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`
                });
                }
        }
        graficaBurbujas.update();
        console.log(datos);
};

function actualizarVacunacionDepartamento(tipo, datos, limpiar){  
        while (graficaLinea.data.datasets.length != 0 && limpiar){
                graficaLinea.data.datasets.pop();
        }
        graficaLinea.data.labels = [];
        let nombre = tipo == "SD" ? "Segundas Dosis" : "Primeras Dosis ";
        let color = tipo == "SD" ? "rgb(101, 76, 165)" : "rgb(244, 113, 64)";
        graficaLinea.data.datasets.push({
                label: nombre,
                data: datos,
                fill: false,
                borderColor: color,
                tension: 0.1,
            }
        );
        graficaLinea.update();
};

function solicitarReporte(form) {
        agregarCarga(form);
        const peticion = new XMLHttpRequest();
        const formulario = new FormData(form);
        peticion.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                        respuesta = JSON.parse(this.responseText);
                        if (respuesta.hasOwnProperty("R")){
                                if(respuesta.R == "S"){
                                        if(respuesta.T == "G"){ 
                                                actualizarCards(respuesta.DATA[respuesta.DATA.length-1]);
                                                actualizarTabla(respuesta.DATA);
                                                actualizarGauge(respuesta.DATA[respuesta.DATA.length-1]);
                                                actualizarMapa(respuesta.DATA);
                                                actualizarGraficoBurbujas(respuesta.DATA);
                                        }else if (respuesta.T == "D"){
                                                if (respuesta.hasOwnProperty("PD")){
                                                        actualizarVacunacionDepartamento("PD", respuesta.PD, true);
                                                }
                                                if (respuesta.hasOwnProperty("SD")){
                                                        actualizarVacunacionDepartamento("SD", respuesta.SD, false);
                                                }
                                        }
                                }else if (respuesta.R == "E"){
                                        mensajeError("Error al cargar la información");
                                }
                        }
                        eliminarCarga(form);
                }
        };
        peticion.onloadend = function () {
                if (this.status / 100 == 4 || this.status / 100 == 5) {
                        mensajeError("Error al cargar la Información");
                        eliminarCarga(form);
                }
        };
        peticion.open("POST", "./cgi/controlador.py");
        peticion.send(formulario);
};

//------------------------- Cargado de Departamentos -----------------------------
function cargarDepartamentos(){
        const peticion = new XMLHttpRequest();
        peticion.open("GET","./cgi/controlador.py?reporte=departamentos");
        peticion.send(null);
        peticion.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                        respuesta = JSON.parse(this.responseText);
                        if (respuesta.R == "S"){
                                const fragment = document.createDocumentFragment();
                                for (departamento of respuesta.DEP){
                                        const opcion = document.createElement("OPTION");
                                        opcion.setAttribute("value", departamento.COD);
                                        opcion.textContent = departamento.NOM;
                                        fragment.appendChild(opcion);
                                }
                                fragment.lastElementChild.selected = "selected";
                                document.getElementById("seleccion_departamento").appendChild(fragment);
                                const cargar = document.getElementById("cargar_reporter_departamento");
                                if(cargar.value === "inicio"){
                                        solicitarReporte(document.getElementById("reporte-diario-departamento"));
                                        cargar.value = "cargado";
                                }
                        }else{
                                mensajeError("Error al cargar los Departamentos");
                        }
                }
        }
};


//------------------------------- Estilos Mapa -------------------------------------

function actualizarMapa(datos){
        //console.log(datos);
        //datos.forEach(
        //function(dept){
        //    const excepciones = ['BAR', 'CAR', 'STM', 'BAV', 'CO'];
        //    if(!excepciones.includes(dept.COD)){
        //        var op = parseFloat(dept.EFEC_PROM);
        //        var totalidad = parseFloat(dept.APLI_FIN)/parseFloat(dept.POB);
        //        var color = '#009900';
        //        if(totalidad < 0.66){
        //            color = '#F6BE00';
        //        }
        //        if(totalidad < 0.33){
        //            color = '#a1000e';
        //        }
        //console.log(totalidad);
        //        mapa.setPaintProperty(dept.COD, 'fill-color', color);
        //        mapa.setPaintProperty(dept.COD,'fill-opacity',op/100);
        //    }
        //});
}
