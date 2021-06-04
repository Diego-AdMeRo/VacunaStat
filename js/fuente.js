var mapa, medidorGauge, graficaBurbujas, graficaLinea, capas = [], datos = {};
var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
});

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
        mapa.on("mousemove", function (e) {
                var fs = mapa.queryRenderedFeatures(e.point, {
                        layers: capas
                });
                if (fs.length > 0 && datos.length > 0) {
                        f = fs[0];
                        mapa.getCanvas().style.cursor = "pointer";
                        var dept = {};
                        datos.forEach((e)=> {
                                if(e['COD']== f.layer.id){
                                        dept = e;
                                }
                        });
                        popup.setLngLat(e.lngLat)
                            .setHTML(
                                    `<h6 style="text-align: center; font-weight: bold"> ${dept.NOM} - (${f.layer.id})</h6>
                                    <p>Poblacion: </b>${formatoNumero(dept.POB)}</br>
                                    <b>VS-FI: </b>${formatoNumero(dept.ASIG_INI)}</br>
                                    <b>VS-FF: </b>${formatoNumero(dept.ASIG_FIN)}</br>
                                    <b>VA-FI: </b>${formatoNumero(dept.APLI_INI)}</br>
                                    <b>VA-FF: </b>${formatoNumero(dept.APLI_FIN)}</br>
                                    <b>E-FI: </b>${formatoNumero(dept.EFEC_INI)}%</br>
                                    <b>E-FF: </b>${formatoNumero(dept.EFEC_FIN)}%</br>
                                    <b>E-P: </b>${formatoNumero(dept.EFEC_PROM)}%</br>
                                    <b>T-E: </b>${formatoNumero(dept.EFEC_TEND)}%</br>
                                    <b>V%: </b>${formatoNumero(dept.PORC_VAC)}%</p>`
                            ).addTo(mapa);
                } else {
                    mapa.getCanvas().style.cursor = "";
                    popup.remove();
                }
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

//------------------------Validador de Fecha -------------------------------------
function validarFecha(elemento, tipo){
    const padre = document.getElementById("menu__reporte");
    const error = padre.lastElementChild.lastElementChild.previousElementSibling;
    if (error != null){
            if (error.textContent.trim() == "La Fecha superior es menor a la inferior, favor volver a intentar"){
                    padre.removeChild(padre.lastElementChild);    
            }
    }
    if (tipo == "FF"){
            console.log("Fecha Final");
            if (new Date(elemento.parentElement.firstElementChild.value).getTime() >= new Date(elemento.value).getTime()){
                    mensajeError("La Fecha superior es menor a la inferior, favor volver a intentar");
            }
    }else if (tipo == "FI"){
            console.log("Fecha Inicial");
            if (new Date(elemento.parentElement.lastElementChild.previousElementSibling.previousElementSibling.value).getTime() <= new Date(elemento.value).getTime()){
                    mensajeError("La Fecha superior es menor a la inferior, favor volver a intentar");
            }
    }
}

//-------------------------Formato numerico de los datos---------------------------

function formatoNumero(numero){
        return new Intl.NumberFormat("es-CO").format(numero);
};

function actualizarCards(datos){
        //Dosis Asignadas, Efectividad, Dosis Aplicadas, Primeras Dosis, Segundas Dosis
        document.getElementById("card_dosis_asignadas").textContent = formatoNumero(datos.ASIG_FIN);
        document.getElementById("card_efectividad").textContent = `${formatoNumero(datos.EFEC_FIN)} %`;
        document.getElementById("card_dosis_aplicadas").textContent = formatoNumero(datos.APLI_FIN + datos.SEG_DOSIS);
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
                        [`% vacunados necesarios para lograr inmunidad por revaño`, 70]           
                ],
        });
};

function actualizarGraficoBurbujas(datos){
        while(graficaBurbujas.data.datasets.length !== 0){
                 graficaBurbujas.data.datasets.pop();
        }
        //graficaBurbujas.data.labels = [];
        for (departamento of datos){
                if(departamento.COD !== "CO"){
                graficaBurbujas.data.datasets.push({
                        label: departamento.NOM,
                        title: departamento.NOM,
                        data: [{x: departamento.IND_POBR*100, y: departamento.POB/1000, r: departamento.PORC_VAC/4.8}], 
                        backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                        poblacion: departamento.POB,
                        porcentajeVacunacion: departamento.PORC_VAC,
                        indicePobreza: departamento.IND_POBR*100
                });
                }
        }
        graficaBurbujas.update();
};

function actualizarVacunacionDepartamento(tipo, datos, limpiar){  
        if(limpiar){
                while (graficaLinea.data.datasets.length != 0){
                        graficaLinea.data.datasets.pop();
                }
                let labels = []
                datos.forEach(dato => labels.push(dato.x));
                graficaLinea.data.labels = labels;
        }
        if (tipo == "SD"){
        //console.log(datos);
        //console.log(graficaLinea.data);
        }
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
                                                actualizarCards(respuesta.D[respuesta.D.length-1]);
                                                actualizarTabla(respuesta.D);
                                                actualizarGauge(respuesta.D[respuesta.D.length-1]);
                                                actualizarMapa(respuesta.D);
                                                actualizarGraficoBurbujas(respuesta.D);
                                                datos = respuesta.D;
                                        }else if (respuesta.T == "D"){
                                                if (respuesta.hasOwnProperty("PD")){
                                                        actualizarVacunacionDepartamento("PD", respuesta.PD, true);
                                                }
                                                if (respuesta.hasOwnProperty("SD")){
                                                        actualizarVacunacionDepartamento("SD", respuesta.SD, false);
                                                }
                                        }
                                }else if (respuesta.R == "E"){
                                        if (respuesta.T == "PF"){
                                                mensajeError("La Fecha superior es menor a la inferior, favor volver a intentar");
                                        }else if (respuesta.T == "EV"){
                                                mensajeError("El formato de la fecha ingresado es incorrecto, favor volver a intentar");
                                        }else if (respuesta.T == "EC"){
                                                mensajeError("Las fechas ingresadas no son validas, favor volver a intentar");
                                        }else if (respuesta.T == "DE"){
                                                mensajeError("El departamento ingresado es incorrecto, favor volver a intentar");
                                        }else{
                                                mensajeError("Error al cargar la información, favor volver a intentar");
                                        }
                                }
                        }
                        eliminarCarga(form);
                }
        };
        peticion.onloadend = function () {
                if (this.status / 100 == 4 || this.status / 100 == 5) {
                        mensajeError("Error al cargar la Información, favor volver a intentar");
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
                                        if (departamento.COD != "CO"){
                                            capas.push(departamento.COD);
                                        }
                                }
                                fragment.lastElementChild.selected = "selected";
                                document.getElementById("seleccion_departamento").appendChild(fragment);
                                const cargar = document.getElementById("cargar_reporter_departamento");
                                if(cargar.value === "inicio"){
                                        solicitarReporte(document.getElementById("reporte-diario-departamento"));
                                        cargar.value = "cargado";
                                }
                                const visitas = document.getElementById("pg-contador");
                                visitas.textContent = formatoNumero(respuesta.V);
                        }else if (respuesta.R == "E"){
                                if (respuesta.T == "DE"){
                                        mensajeError("El departamento ingresado es incorrecto, favor volver a intentar");
                                }else{
                                        mensajeError("Error al cargar los Departamentos, favor volver a intentar");
                                }
                        }
                }
        }
};


//------------------------------- Estilos Mapa -------------------------------------
function actualizarMapa(datos) {
        //console.log(datos);
        datos.forEach(function (dept) {
                //const excepciones = ["BAR", "CAR", "STM", "BAV", "CO"];
                //if (!excepciones.includes(dept.COD)) {
                if(dept.COD != "CO"){
                        var op = parseFloat(dept.EFEC_PROM);
                        var totalidad = parseFloat(dept.APLI_FIN) / parseFloat(dept.POB);
                        var color = "#009900";
                        if (totalidad < 0.66) {
                                color = "#F6BE00";
                        }
                        if (totalidad < 0.33) {
                                color = "#a1000e";
                        }
                        //console.log(totalidad);
                        mapa.setPaintProperty(dept.COD, "fill-color", color);
                        mapa.setPaintProperty(dept.COD, "fill-opacity", op / 100);
                }
        });
};
