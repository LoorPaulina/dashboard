import {tiempoArr, precipitacionArr, uvArr, temperaturaArr} from './static_data.js';

let fechaActual = () => new Date().toISOString().slice(0,10);

let cargarPrecipitacion = () => {
    let actual= fechaActual();
    let datos = [];

    for (let index=0; index < tiempoArr.length; index++){
        const tiempo = tiempoArr[index];
        const precipitacion = precipitacionArr[index];

        if(tiempo.includes(actual)){
            datos.push(precipitacion);
        }
    }

  let max = Math.max(...datos);
  let min = Math.min(...datos);
  let sum = datos.reduce((a, b) => a + b, 0);
  let prom = (sum / datos.length) || 0;

  let precipitacionMinValue = document.getElementById("precipitacionMinValue");
  let precipitacionPromValue = document.getElementById("precipitacionPromValue");
  let precipitacionMaxValue = document.getElementById("precipitacionMaxValue");

  precipitacionMinValue.textContent = `Min ${min} [mm]`;
  precipitacionPromValue.textContent = `Prom ${ Math.round(prom * 100) / 100 } [mm]`;
  precipitacionMaxValue.textContent = `Max ${max} [mm]`;
}

let cargarFechaActual= () => {
    let coleccionHTML = document.getElementsByTagName("h6")
    let tituloH6 = coleccionHTML[0]
}

let cargarOpenMeteo = () => {
    let URL="https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto";

    fetch (URL)

    .then(responseText => responseText.json())
    .then(responseJSON => {
      
        let plotRef = document.getElementById('plot1');
        
         //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;

        //Etiquetas de los datos
        let data = responseJSON.hourly.temperature_2m;
        let data2 = responseJSON.hourly.uv_index;

        //Objeto de configuración del gráfico
        let config = {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [
            {
                label: 'Temperature [2m]',
                data: data, 
            },
            {
                label: 'UV Index',
                data: data2,
            }
            ]
        }
        };

    //Objeto con la instanciación del gráfico
    let chart1  = new Chart(plotRef, config);
    console.log(responseJSON);
  })
    .catch(console.error);
}

let cargarOpenMeteo2 = () => {
    let URL2="https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=precipitation_probability&timezone=auto";
    
    fetch (URL2)

    .then(responseText => responseText.json())
    .then(responseJSON => {
      
        let plotRef2= document.getElementById('plot2');
        
         //Etiquetas del gráfico
        let labels = responseJSON.hourly.time;

        //Etiquetas de los datos
        let data = responseJSON.hourly.precipitation_probability;

        //Objeto de configuración del gráfico
        let config = {
        type: 'bar',
        backgroundColor: 'black',
        data: {
            labels: labels, 
            datasets: [
            {
                label: 'Precipitacion probability',
                data: data, 
                backgroundColor: 'pink'
            },
            ]
        }
        };

    //Objeto con la instanciación del gráfico
    let chart2 = new Chart(plotRef2, config);
    console.log(responseJSON);
  })
    .catch(console.error);
}

//Callback
let selectListener = async (event) => {
  
    let selectedCity = event.target.value

    // Lea la entrada de almacenamiento local
    let cityStorage = localStorage.getItem(selectedCity);

    if (cityStorage == null) {
    try {

        //API key
        let APIkey = '1a3612948dbb57426cdf0168f648a395'
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`

        let response = await fetch(url)
        let responseText = await response.text()

        // Guarde la entrada de almacenamiento local
         
        let parseXML= (responseText) => {

            const parser = new DOMParser();
            const xml = parser.parseFromString(responseText, "application/xml");
        
        
            // Referencia al elemento `#forecastbody` del documento HTML
        
            let forecastElement = document.querySelector("#forecastbody")
            forecastElement.innerHTML = ''
        
            // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
            let timeArr = xml.querySelectorAll("time")
        
            timeArr.forEach(time => {
                
                let from = time.getAttribute("from").replace("T", " ");
                let humidity = time.querySelector("humidity").getAttribute("value");
                let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
                let precipitation = time.querySelector("precipitation").getAttribute("probability")
                let pressure = time.querySelector("pressure").getAttribute("value")
                let cloud = time.querySelector("cloud").getAttribute("all")
        
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

    await localStorage.setItem(selectedCity, responseText)

    } catch (error) {
        console.log(error)
    }

    } else {
        // Procese un valor previo
        parseXML(cityStorage)
    }

}
  
let loadForecastByCity = () => {
  
    //Handling event
    let selectElement = document.querySelector("select")
    selectElement.addEventListener("change", selectListener)
  
}

loadForecastByCity();
cargarPrecipitacion();
cargarFechaActual()
cargarOpenMeteo();
cargarOpenMeteo2();
