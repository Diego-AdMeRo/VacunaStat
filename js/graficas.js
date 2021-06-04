 const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
 const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

//-------------------------------------- Mapbox ------------------------------------------------------
function crearMapa(contenedorId) {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbmRvbnJvZHJpZ3VleiIsImEiOiJja3A1bDNldzEwN3h2Mm9vNDU2dnBidnZ1In0.gurWHEYxW8JQObauwFHdog';
        var mapa = new mapboxgl.Map({
            container: "mapa",
            style: "mapbox://styles/brandonrodriguez/ckp1nxqtf2uov18rsjca7ishu",
            center: [-73.192406, 4.053942],
            zoom: 4
        });
        return mapa;
};

function crearMedidorGauge(contenedorId) {
        return c3.generate({
                bindto: contenedorId,
                data: {
                        columns: [["vacunados", 100]],  
                        type: "gauge",
                },
                color: {
                        pattern: ["#FF0000", "#F97600", "#F6C600", "#60B044"],
                        threshold: {
                                values: [30, 50, 69, 100]
                        },
                },
                gauge: {
                        label:{
                                format: function(value, ratio){
                                        return value + "%"; 
                                }
                        }
                }
        });
};

function crearGraficaDeBurbujas(contenedorId) {
        return new Chart(document.getElementById(contenedorId).getContext('2d'), {
                type: 'bubble',
                data: {
                        labels: [],
                        datasets: [{
                                label: '',
                                data: [
                                        { x: 5, y: 5, r: 10},
                                        { x: 10, y: 10, r: 15 },
                                        { x: 16, y: 15, r: 18 }
                                ],
                                backgroundColor: '#76d1bf'
                        }, {
                                label: '',
                                data: [
                                        { x: 3, y: 10, r: 10 },
                                        { x: 7, y: 11, r: 15 },
                                        { x: 12, y: 6, r: 18 }
                                ],
                                backgroundColor: '#827ada'
                        }]
                },
                options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: {
                                display: false
                        },
                        tooltips: {
                                callbacks: {
                                        label: function(tooltipItem, data){
                                                const info = data.datasets[tooltipItem.datasetIndex];
                                                let datos = [`${info.label}`]; 
                                                datos.push(`Población: ${formatoNumero(info.poblacion)}`);
                                                datos.push(`Indice de pobreza: ${formatoNumero(info.indicePobreza)}%`);
                                                datos.push(`Porcentaje de vacunados: ${formatoNumero(info.porcentajeVacunacion)}%`);
                                                return datos;
                                        }
                                }
                        },
                        plugins:{
                                datalabels: {
                                        anchor: function (context) {
                                                var value = context.dataset.data[context.dataIndex];
                                                return value.x < 1000 ? 'end' : 'center';
                                        },
                                        align: function (context) {
                                                var value = context.dataset.data[context.dataIndex];
                                                return value.x < 1000 ? 'end': 'center';
                                        },
                                        color: function (context) {
                                                var value = context.dataset.data[context.dataIndex];
                                                return value.x < 1000 ? context.dataset.backgroundColor : 'white';
                                        },
                                        font: {
                                                weight: 'bold'
                                        },
                                        formatter: function (value, context){ 
                                                return context.dataset.label;
                                        },
                                        offset: 2,
                                        padding: 0
                                }
                        },
                        scales: {
                                xAxes: [{
                                        display: true,
                                        scaleLabel:{
                                                display: true,
                                                labelString: "Indice de Pobreza"
                                        }
                                }],
                                yAxes: [{
                                        display: true,
                                        scaleLabel:{
                                                display: true,
                                                labelString: "Población por cada 1000 personas"
                                        }
                                }]
                        }
                }
        });
};

function crearGraficaLinea(contenedorId) {
        return new Chart(document.getElementById(contenedorId).getContext('2d'), {
                type: "line",
                data: {
                        labels: [],
                        datasets: [{
                                label: "",
                                data: [],
                                fill: false,
                                borderColor: "rgb(75, 192, 192)",
                                tension: 0.1,
                            },
                        ],
                },
                options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        title: {
                                display: true,
                                text: "Vacunación diaria por Departamento",
                                fontSize: 20
                        },
                        plugins:{
                                datalabels: {
                                        display: false,
                                }
                        },
                        tooltips: {
                                callbacks: {
                                        title: function(tooltipItem, data){
                                                    //console.log(tooltipItem);
                                                    //console.log(data);
                                                    const fecha = new Date(data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].x);
                                                    fecha.setDate(fecha.getDate() + 1);
                                                    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
                                        },
                                        label: function(tooltipItem, data){
                                                   return `Se aplicaron ${formatoNumero(tooltipItem.yLabel)} de ${data.datasets[tooltipItem.datasetIndex].label}`;
                                        }
                                }       
                        }
               }
        });
};
