import{tiempoArr, precipitacionArr, uvArr, temperaturaArr} from './static_data.js';
let fechaActual = () => new Date().toISOString().slice(0,10);

let cargarPrecipitacion= ()=>{
    let fecha = fechaActual();
    let arrTemp = []
    for (let index=0; index<tiempoArr.length; index++){
        const tiempo = tiempoArr[index]
        const precipitacion = precipitacionArr[index]
        if (tiempo.includes(fecha)){
            arrTemp.push(precipitacion);
        }
    }

    let min, max, prom;
    min = Math.min(...arrTemp);
    max = Math.max(...arrTemp);
    prom = arrTemp.reduce((a, b) => a + b, 0)/arrTemp.length;
    let precipitacionMinValue = document.getElementById("precipitacionMinValue")
    let precipitacionPromValue = document.getElementById("precipitacionPromValue")
    let precipitacionMaxValue = document.getElementById("precipitacionMaxValue")
    precipitacionMinValue.textContent = `Min ${min} [mm]`;
    precipitacionMaxValue.textContent = `Max ${max} [mm]`;
    precipitacionPromValue.textContent = `Prom ${ Math.round(prom * 100) / 100 } [mm]`
}
cargarPrecipitacion();
let cargarFechaActual = ()=>{
    document.getElementsByTagName('h6')[0].textContent = fechaActual();
}
cargarFechaActual();

let cargarOpenMeteo = ()=>{
    let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto';
    fetch(URL)
    .then(responseText => responseText.json())
    .then (responseJSON =>{
        //codigo para el chart
        let plotRef = document.getElementById('plot1');

    //Etiquetas del gráfico
    let labels = responseJSON.hourly.time;

    //Etiquetas de los datos
    let data = responseJSON.hourly.temperature_2m;

    //Objeto de configuración del gráfico
    let config = {
      type: 'line',
      data: {
        labels: labels, 
        datasets: [
          {
            label: 'Temperature [2m]',
            data: data, 
          }
        ]
      }
    };

    //Objeto con la instanciación del gráfico
    let chart1  = new Chart(plotRef, config);
    })
    .catch(console.error);

}

cargarOpenMeteo();

let parseXML = (responseText) => {

  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");


  // Referencia al elemento `#forecastbody` del documento HTML

  let forecastElement = document.querySelector("#forecastbody")
  forecastElement.innerHTML = ''

  // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
  let timeArr = xml.querySelectorAll("time")

  timeArr.forEach(time => {
      
      let from = time.getAttribute("from").replace("T", " ")

      let humidity = time.querySelector("humidity").getAttribute("value")
      let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
      let precipitation = time.querySelector("precipitation").getAttribute("probability")
      let pressure = time.querySelector("pressure").getAttribute("value")
      let cloud =time.querySelector("clouds").getAttribute("value")

      let template = `
          <tr>
              <td>${from}</td>
              <td>${humidity}</td>
              <td>${windSpeed}</td>
              <td>${precipitation}</td>
              <td>${pressure}</td>
              <td>${cloud}</td>
          </tr>
      `

      //Renderizando la plantilla en el elemento HTML
      forecastElement.innerHTML += template;
  })

}

//Callback
let selectListener = async (event) => {

  let selectedCity = event.target.value
  let cityStorage = localStorage.getItem(selectedCity);
  console.log(cityStorage);
  if (cityStorage == null ) {
    
    try {
       //API key
       let APIkey = '4bc0afeecf73d808a4843fb335dffe09'
       let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`
 
       let response = await fetch(url)
       let responseText = await response.text()
      
       await localStorage.setItem(selectedCity, responseText)

    } catch (error) {
       console.log(error)
    }

} else {
    // Procese un valor previo
    parseXML(cityStorage)
    //hacer que solo se llame cada 3 horas

}


}



let loadForecastByCity = () => {

  let selectElement = document.querySelector("select")
  selectElement.addEventListener("change", selectListener)

}

let ciudad='Machala';

function obtenerCiudad(posicion) {
  // Creamos un objeto XMLHttpRequest para realizar la petición a la API de geolocalización
  var xhr = new XMLHttpRequest();

  // Preparamos la petición a la API de geolocalización, pasando las coordenadas obtenidas como parámetros
  xhr.open('GET', `https://nominatim.openstreetmap.org/reverse?format=json&lat=${posicion.coords.latitude}&lon=${posicion.coords.longitude}&zoom=18&addressdetails=1`, true);

  // Configuramos la petición para que nos devuelva los datos en formato JSON
  xhr.responseType = 'json';

  // Cuando la petición finalice, obtenemos el nombre de la ciudad
  xhr.onload = function() {
      if (xhr.status === 200) {
          var respuesta = xhr.response;
          ciudad=respuesta.address.city;
          console.log(ciudad);
      } else {
          console.log('Error: ' + xhr.status);
      }
  };

  // Realizamos la petición
  xhr.send();
}

// Obtenemos la ubicación actual del usuario
navigator.geolocation.getCurrentPosition(obtenerCiudad, function(error) {
  console.log('Error de geolocalización: ' + error.message);
});



//cargando el contenedor izquierdo
let url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&mode=xml&appid=4bc0afeecf73d808a4843fb335dffe09`


let response = await fetch(url)
let responseText = await response.text()

let parseCiudadXML = (responseText) => {

  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");

  let cont_izquierdo = document.querySelector("#contenedor-izquierdo")
  cont_izquierdo.innerHTML = ''

  let timeArr = xml.getElementsByTagName("time");


  let cod_img= timeArr[0].querySelector("symbol").getAttribute("var");
  let URLimg= `https://openweathermap.org/img/wn/${cod_img}@2x.png`;
  let temperature= timeArr[0].querySelector("temperature").getAttribute("value");
  let weather= timeArr[0].querySelector("symbol").getAttribute("name");
  let max= timeArr[0].querySelector("temperature").getAttribute("max");
  let min= timeArr[0].querySelector("temperature").getAttribute("min");

  var fechaActual = new Date();
  var month= fechaActual.toString().split(" ")[1];
  var day = fechaActual.toString().split(" ")[2];
  var year= fechaActual.toString().split(" ")[3];
  var hour= fechaActual.toString().split(" ")[4];


  let template=
  `
  <div class="card" id="now">
      <h4>Today</h4>
      <img src= ${URLimg}>
      <h2>${parseInt(temperature-273.15)}°C</h2>
      <h2>&#x1F4CDGuayaquil</h2>
      <h4>${weather}</h4>
      <p>&#x1F4C5${month + " " + day + ", "+ year + "      "+hour}</p>
      
      <p>Max: ${parseInt(max-273.15)}°C - Min:${parseInt(min-273.15)}°C</p>
    </div>

    <h4>3 Days Forecast</h4>

    <div class="card" id="prediction">
    </div>
  `
  cont_izquierdo.innerHTML += template;

  let diaHoy=parseInt(fechaActual.toString().split(" ")[2]);

  let prediction= document.getElementById("prediction");
  for(let i=0; i<timeArr.length; i++){

    diaHoy= diaHoy;
    let fecha=parseInt(timeArr[i].getAttribute("from").toString().split("T")[0].split("-")[2]);
    

    //revisa los días no repetidos para la predicción
    if(fecha>diaHoy){
      let cod_img= timeArr[i].querySelector("symbol").getAttribute("var");
      let URLimg= `https://openweathermap.org/img/wn/${cod_img}@2x.png`;
      let temperature= timeArr[i].querySelector("temperature").getAttribute("value");
      let weather= timeArr[i].querySelector("symbol").getAttribute("name");
      let plantilla=`
        <div class="prediction_day">
        <div id="contenedor_img">
        <img src= ${URLimg}>
        </div>
        <div id="data_prediction">
        <p>${weather}</p>
        <p>${month +" "+fecha+", "+year}</p>
        <p>${parseInt(temperature-273.15)}°C</p>
        </div>
        </div>`

      prediction.innerHTML += plantilla;
      diaHoy=fecha;
    }
    
  }
}

async function cargarApiSunrise(){

  let endpoint= 'https://api.sunrisesunset.io/json?lat=-2.19616&lng=-79.88621';

  try{
      let response= await fetch(endpoint);
      let json=await response.json();

      console.log(json);
  }catch(error){

  }

}



loadForecastByCity();
parseCiudadXML(responseText);
cargarApiSunrise();

