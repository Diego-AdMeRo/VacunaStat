/*Librerias graficas utilizadas
  Mapbox ->
  c3js -> https://c3js.org/examples.html 
  chart.js ->
 */

//-------------------------------------- Mapbox ------------------------------------------------------
function crearMapa(contenedorId) {
        /* Sirve para definir un rango de visibilidad
           var bounds = [
           [-5.117415, -66.334165],
           [ 12.909586,-82.274875],
           ];*/
        mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbmRvbnJvZHJpZ3VleiIsImEiOiJja3A1bDNldzEwN3h2Mm9vNDU2dnBidnZ1In0.gurWHEYxW8JQObauwFHdog';

        var mapa = new mapboxgl.Map({
                container: contenedorId,
                style: "mapbox://styles/mapbox/streets-v11",
                //style: "mapbox://styles/brandonrodriguez/ckp1nxqtf2uov18rsjca7ishu",
                center: [-73.192406, 4.053942],
                zoom: 4,
                attributionControl: false,
                maxZoom: 9,
                minZoom: 3,
                //maxBounds: bounds,
        });
        mapa.on('load', function () {
                mapa.addSource(
                        'departamentos', {
                                'type': 'vector',
                                'url': 'mapbox://brandonrodriguez.blbzaatl'
                });
                mapa.addLayer({
                        'id': 'departamentos-vacio',
                        'type': 'fill',
                        'source': 'departamentos',
                        'source-layer': 'departamentos_colombia',
                        'paint': {
                                'fill-outline-color': '#484896',
                                'fill-color': '#6e599f',
                                'fill-opacity': 0.75
                        }
                    },
                        'settlement-label'
               );
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
                            values: [30, 50, 69, 100],
                        },
                },
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
						{ x: 5, y: 5, r: 10 },
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
                maintainAspectRatio: false
			}
		});
};

function crearGraficaLinea(contenedorId) {
        return new Chart(document.getElementById(contenedorId).getContext('2d'), {
                type: "line",
                data: {
                        labels: [1, 2, 3, 4, 5, 6, 7],
                        datasets: [{
                                label: "My First Dataset",
                                data: [65, 59, 80, 81, 56, 55, 40],
                                fill: false,
                                borderColor: "rgb(75, 192, 192)",
                                tension: 0.1,
                            },
                        ],
                },
                options: {
                        responsive: true,
                        maintainAspectRatio: false,
                },
        });
};
