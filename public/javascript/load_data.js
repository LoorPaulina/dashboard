import{tiempoArr, precipitacionArr, uvArr, temperaturaArr} from './static_data.js';
var fechaActual = new Date();
var hour = parseInt(fechaActual.toString().split(" ")[4]);
var month= fechaActual.toString().split(" ")[1];
var day = fechaActual.toString().split(" ")[2];
var year= fechaActual.toString().split(" ")[3];
var hour= fechaActual.toString().split(" ")[4];

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
 "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];
let monthNumber=monthNames.indexOf(month) + 1;




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
      backgroundColor: 'black',
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

let ciudad='Guayaquil';


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

  let humidity = timeArr[0].querySelector("humidity").getAttribute("value");

  let visibility = timeArr[0].querySelector("visibility").getAttribute("value");

  let feel=timeArr[0].querySelector("feels_like").getAttribute("value");


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

  //llenando cartilla de velocidad del viento
  let windSpeed= timeArr[0].querySelector("windSpeed").getAttribute("mps");
  let wind = document.querySelector("#wind");

  wind.innerHTML += `<div class="windText"><h4>${windSpeed}</h4><p>m/s</p></div>`;

  //llenando cartilla de humedad
  let contenedorHumidity= document.querySelector("#humidity div");
  let plantillaHumidity= `<h4>${humidity}%</h4>
  <i class="fas fa-tint"></i>`

  contenedorHumidity.innerHTML += plantillaHumidity;

    //llenando cartilla de visibilidad
    let contenedorVisibility= document.querySelector("#visibility div");
    let plantillaVisibility= `<h4>${visibility}</h4>
    <i class="fas fa-eye"></i>`
  
    contenedorVisibility.innerHTML += plantillaVisibility;

    //llenando cartilla de feel like
    let contenedorFeel= document.querySelector("#feel div");
    let plantillaFeel= `<h4>${parseInt(feel-273.15)}</h4>
    <i class="fas fa-thermometer-half"></i>`
  
    contenedorFeel.innerHTML += plantillaFeel;



}

async function cargarApiSunrise(){

  let endpoint= `https://api.sunrisesunset.io/json?lat=-2.19616&lng=-79.88621&timezone=America/Guayaquil&date=${year+"-"+monthNumber+"-"+day}`;
  try{
      let response= await fetch(endpoint);
      let json=await response.json();

      let sunrise=json.results.sunrise;
      let sunset= json.results.sunset;

      let contenedorSunrise= document.getElementById("sunrises");
      let contenedorSunset= document.getElementById("sunset");
      
      contenedorSunrise.innerHTML = `<p>${sunrise}</p>`
      contenedorSunset.innerHTML = `<p>${sunset}</p>`

  }catch(error){

  }

}

async function cargarApiMeteo(){

  let endpoint= 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=uv_index&timezone=auto&forecast_days=1';
  let uv_card= document.querySelector("#uv p");
  let uv_Number= document.querySelector(".number");

  try{
    let response= await fetch(endpoint);
    let json=await response.json();

    let horas=json.hourly.time;
    let uv= json.hourly.uv_index;

    let index=0;


    for(let i=0; i<horas.length; i++){
      if(horas[i].split("T")[1].split(":")[0]==hour){
          index=uv[i];
      }
    }

    let uv_description= ["LOW", "MODERATE", "MEDIUM", "HIGH", "EXTREME"];
    let description="";

    index=parseFloat(index);
      if(index<=0 || index<=2){
        description=uv_description[0];
      }else if(index<=3 || index<=5){
        description=uv_description[1];
      }else if(index<=6 || index<=7){
        description=uv_description[2];
      }else if(index<=8 || index<=10){
        description=uv_description[3];
      }else{
        description=uv_description[4];
      }


    uv_card.innerHTML = `<h4>${index}   U.V</h4>`;
    uv_Number.innerHTML += `<p>${description}</p>`

    let rotacion= index *10;
    console.log(rotacion)
    
    document.querySelector(".needle").style.transform = `rotate(${rotacion}deg)`;
  



}catch(error){

}
}

//Dibujando solcito
var c1 = document.getElementById("canvas1");
var c2 = document.getElementById("canvas2");

var ctx = c1.getContext("2d");
ctx.beginPath();
ctx.arc(100, 100, 90, 0, 2 * Math.PI);
ctx.lineWidth = 2;
ctx.stroke();

animateCanvas();

function animateCanvas(){
  var w = 0;
  var timer = setInterval(function(){
    c2.width = w;
    w += 1;
        var ctx = c2.getContext("2d");
        ctx.beginPath();
        ctx.arc(100, 100, 89, 0, 2 * Math.PI);
        ctx.fillStyle = "#efba32";
        ctx.fill();
    if (w===200){clearInterval(timer)}
  }, 20);
}





loadForecastByCity();
parseCiudadXML(responseText);
cargarApiMeteo();
cargarApiSunrise();

