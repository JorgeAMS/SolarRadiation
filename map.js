var map;
var Lat;
var Long;
var Ls;
var Alt = 0.142;
var marker;
var datos = [];

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {
      lat: 8.9987481,
      lng: -74.1963213
    }
  });
  var marker;
  google.maps.event.addListener(map, 'click', function (event) {
    placeMarker(event.latLng);
    Lat = event.latLng.lat();
    Long = event.latLng.lng();
  });

  function placeMarker(location) {
    marker = new google.maps.Marker({
      position: location,
      icon: 'assets/solar-panel.png',
      map: map
    });
  }
}

function dtor(degrees) {
  rad = degrees * Math.PI / 180;
  return rad;
}

function rtod(rad) {
  degrees = rad * 180 / Math.PI;
  return degrees;
}

function calcLs() {
  for (i = -11; i <= 12; i++) {
    if ((i * 15) - Long <= 15 && (((i + 1) * 15) - Long <= 15)) {
      if ((i * 15) - Long <= (((i + 1) * 15) - Long <= 15)) {
        Ls = i * 15;
      } else {
        Ls = (i + 1) * 15;
      }
    }
  }
}

function Resultado() {
  if (Lat == undefined) {
    alert("Seleccione una posicion en el mapa")
  } else {
    var Dates = document.getElementById('Fecha').value; //Obtenemos la Fecha
    var Hour = document.getElementById('Hora').value; //Obtenemos la Hora
    var giro = document.getElementById('Giro').value; //Obtenemos el Angulo de giro del colector (Alpha2)
    var inclinacion = document.getElementById('Inclinacion').value; //Obtenemos la Inclinacion del colector (Beta2)
    var foreground = document.getElementById('Terreno').value; //Obtenemos el valor del tipo de terreno
    var date = Dates.split("-"); //Dividimos Año, Mes, y Dia
    var hour = Hour.split(":"); //Dividimos horas y minutos
    var Year = parseInt(date[0]); //Año
    var Month = parseInt(date[1]); //Mes
    var Day = parseInt(date[2]); //Dia
    var TLE = (hour[0] * 60) + parseInt(hour[1]); //Tiempo local aparente
    var biciesto;

    if ((Year % 4) == 0 && (Year % 100) > 0 || (Year % 400) == 0) //Calculamos si el año selecto es biciesto o no
      biciesto = 29;
    else
      biciesto = 28;

    var N = Day; //Ponemos como valor inicial de N el dia selecto
    var CountDays = [31, biciesto, 30, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //Declaramos el vector con la cantidad de dias por mes

    for (var i in CountDays) { //Calculamos N
      if (i < Month - 1)
        N = N + CountDays[i];
    }
    var D = (N - 81) * (360 / 365); //Calculamos D, (Vease Ecuacion del tiempo2.pdf - Pg. 4)
    var Et = 9.87 * Math.sin(dtor(2 * D)) - 7.53 * Math.cos(dtor(D)) - 1.5 * Math.sin(dtor(D)); //Calculamos Et, (Vease Ecuacion del tiempo2.pdf - Pg. 4)
    calcLs();
    var TSV = TLE + (4 * (Ls - Long)) + Et; //*Calculamos Tiempo Solar Verdadero, (Vease Ecuacion del tiempo2.pdf - Pg. 6) - Falta Calcular Ls - Le *ahi va lo que hara Jara*

    var h = (TSV - 720) / 4; //Calculamos el angulo horario "h", (Vease Datos Astronomicos.pdf - Pg. 5)
    var d = 23.45 * Math.sin(dtor((360 / 365) * (284 + N))); //Calculamos la Declinacion "d", (Vease Datos Astronomicos.pdf - Pg. 6)

    var Beta = rtod(Math.asin((Math.cos(dtor(Lat)) * Math.cos(dtor(h)) * Math.cos(dtor(d))) //Calculamos Beta "B", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 2)
      +
      (Math.sin(dtor(Lat)) * Math.sin(dtor(d)))));
    if (Lat > 0) {
      var Alpha = rtod(Math.acos((1 / Math.cos(dtor(Beta))) * ((Math.cos(dtor(Lat)) * Math.sin(dtor(d))) //Calculamos Azimut "A", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 3)
        -
        (Math.cos(dtor(d)) * Math.sin(dtor(Lat)) * Math.cos(dtor(h))))));
    } else {
      var Alpha = rtod(Math.acos((1 / Math.cos(dtor(Beta))) * ((Math.cos(dtor(Lat)) * Math.sin(dtor(d))) //Calculamos Azimut "A", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 3)
        +
        (Math.cos(dtor(d)) * Math.sin(dtor(Lat)) * Math.cos(dtor(h))))));
    }
    var Tetta = (Math.sin(dtor(Beta)) * Math.cos(dtor(inclinacion))) //*Calculamos Tetta "0", (Vease Datos Astronomicos.pdf - Pg. 9) Falta saber q es a2.
      +
      (Math.cos(dtor(Beta)) * Math.sin(dtor(inclinacion)) * Math.cos(dtor(Alpha - giro)));


    var Ac, Bc, Cc; //Definimos variables de la tabla 2.2, (Vease Ecuacion del tiempo2.pdf - Pg. 10)

    switch (true) { //Damos valores de la tabla 2.2 segun N, (Vease Ecuacion del tiempo2.pdf - Pg. 10)
      case (1 <= N && N < 21):
        Ac = 1234;
        Bc = 0.142;
        Cc = 0.057;
        break;
      case (21 <= N && N < 52):
        Ac = 1230;
        Bc = 0.142;
        Cc = 0.058;
        break;
      case (52 <= N && N < 80):
        Ac = 1215;
        Bc = 0.144;
        Cc = 0.060;
        break;
      case (80 <= N && N < 111):
        Ac = 1186;
        Bc = 0.156;
        Cc = 0.071;
        break;
      case (111 <= N && N < 141):
        Ac = 1136;
        Bc = 0.180;
        Cc = 0.097;
        break;
      case (141 <= N && N < 172):
        Ac = 1104;
        Bc = 0.196;
        Cc = 0.121;
        break;
      case (172 <= N && N < 202):
        Ac = 1088;
        Bc = 0.205;
        Cc = 0.134;
        break;
      case (202 <= N && N < 233):
        Ac = 1085;
        Bc = 0.207;
        Cc = 0.136;
        break;
      case (233 <= N && N < 264):
        Ac = 1107;
        Bc = 0.201;
        Cc = 0.122;
        break;
      case (264 <= N && N < 294):
        Ac = 1152;
        Bc = 0.177;
        Cc = 0.092;
        break;
      case (294 <= N && N < 325):
        Ac = 1193;
        Bc = 0.160;
        Cc = 0.073;
        break;
      case (325 <= N && N < 355):
        Ac = 1221;
        Bc = 0.149;
        Cc = 0.063;
        break;
      case (355 <= N && N < 367):
        Ac = 1234;
        Bc = 0.142;
        Cc = 0.057;
        break;
    }


    var ppo = Math.pow(Math.E, (-0.1184 * Alt)); //Calculamos p/po, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
    var Idn = Ac * Math.pow(Math.E, (-ppo * (Bc / Math.sin(dtor(Beta))))); //Calculamos IDN, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
    var Id = Idn * (Tetta); //Calculamos ID, (Vease Ecuacion del tiempo2.pdf - Pg. 9) *Falta calcular Tetta*
    var Is = Cc * Idn * ((1 + Math.cos(dtor(inclinacion))) / 2); //Calculamos Is, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
    var Ir = Idn * foreground * (Cc + Math.sin(dtor(Beta))) //Calculamos Ir, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
      *
      ((1 - Math.cos(dtor(inclinacion))) / 2);
    var Itot = Id + Is + Ir;
    document.getElementById("Beta").value = Beta; //Mostramos el resultado de Beta en la interfaz
    document.getElementById("Azimut").value = Alpha; //Mostramos el resultado de Azimut en la interfaz
    document.getElementById("Directa").value = Id; //Mostramos el resultado de Radiacion Directa en la interfaz
    document.getElementById("Difusa").value = Is; //Mostramos el resultado de Radiacion Difusa en la interfaz
    document.getElementById("Reflejada").value = Ir; //Mostramos el resultado de Radiacion Reflejada en la interfaz
    document.getElementById("Total").value = Itot; //Mostramos el resultado de Radiacion Total en la interfaz

  }
}

function ResultadoIrradiacion() {
  datos = [];
  if (Lat == undefined) {
    alert("Seleccione una posicion en el mapa")
  } else {
    var Dates = document.getElementById('Fecha').value; //Obtenemos la Fecha                          
    var giro = document.getElementById('Giro').value; //Obtenemos el Angulo de giro del colector (Alpha2)
    var inclinacion = document.getElementById('Inclinacion').value; //Obtenemos la Inclinacion del colector (Beta2)
    var foreground = document.getElementById('Terreno').value; //Obtenemos el valor del tipo de terreno
    var date = Dates.split("-"); //Dividimos Año, Mes, y Dia    
    var Year = parseInt(date[0]); //Año
    var Month = parseInt(date[1]); //Mes
    var Day = parseInt(date[2]); //Dia
    var TLE; //Tiempo local aparente
    var biciesto;
    var tiempohorasx = [];
    var radiaciontotaly = [];
    var Betas = [];
    var Alphas = [];
    if ((Year % 4) == 0 && (Year % 100) > 0 || (Year % 400) == 0) //Calculamos si el año selecto es biciesto o no
      biciesto = 29;
    else
      biciesto = 28;

    var N = Day; //Ponemos como valor inicial de N el dia selecto
    var CountDays = [31, biciesto, 30, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //Declaramos el vector con la cantidad de dias por mes

    for (var i in CountDays) { //Calculamos N
      if (i < Month - 1)
        N = N + CountDays[i];
    }
    var D = (N - 81) * (360 / 365); //Calculamos D, (Vease Ecuacion del tiempo2.pdf - Pg. 4)
    var Et = 9.87 * Math.sin(dtor(2 * D)) - 7.53 * Math.cos(dtor(D)) - 1.5 * Math.sin(dtor(D)); //Calculamos Et, (Vease Ecuacion del tiempo2.pdf - Pg. 4)
    calcLs();
    for (TLE = 360; TLE <= 1080; TLE = TLE + 15) {
      var TSV = TLE + (4 * (Ls - Long)) + Et; //*Calculamos Tiempo Solar Verdadero, (Vease Ecuacion del tiempo2.pdf - Pg. 6) - Falta Calcular Ls - Le *ahi va lo que hara Jara*

      var h = (TSV - 720) / 4; //Calculamos el angulo horario "h", (Vease Datos Astronomicos.pdf - Pg. 5)
      var d = 23.45 * Math.sin(dtor((360 / 365) * (284 + N))); //Calculamos la Declinacion "d", (Vease Datos Astronomicos.pdf - Pg. 6)

      var Beta = rtod(Math.asin((Math.cos(dtor(Lat)) * Math.cos(dtor(h)) * Math.cos(dtor(d))) //Calculamos Beta "B", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 2)
        +
        (Math.sin(dtor(Lat)) * Math.sin(dtor(d)))));
      if (Lat > 0) {
        var Alpha = rtod(Math.acos((1 / Math.cos(dtor(Beta))) * ((Math.cos(dtor(Lat)) * Math.sin(dtor(d))) //Calculamos Azimut "A", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 3)
          -
          (Math.cos(dtor(d)) * Math.sin(dtor(Lat)) * Math.cos(dtor(h))))));
      } else {
        var Alpha = rtod(Math.acos((1 / Math.cos(dtor(Beta))) * ((Math.cos(dtor(Lat)) * Math.sin(dtor(d))) //Calculamos Azimut "A", (Vease Datos Astronomicos.pdf - Pg. 8 - Ecuacion 3)
          +
          (Math.cos(dtor(d)) * Math.sin(dtor(Lat)) * Math.cos(dtor(h))))));
      }
      var Tetta = (Math.sin(dtor(Beta)) * Math.cos(dtor(inclinacion))) //*Calculamos Tetta "0", (Vease Datos Astronomicos.pdf - Pg. 9) Falta saber q es a2.
        +
        (Math.cos(dtor(Beta)) * Math.sin(dtor(inclinacion)) * Math.cos(dtor(Alpha - giro)));


      var Ac, Bc, Cc; //Definimos variables de la tabla 2.2, (Vease Ecuacion del tiempo2.pdf - Pg. 10)

      switch (true) { //Damos valores de la tabla 2.2 segun N, (Vease Ecuacion del tiempo2.pdf - Pg. 10)
        case (1 <= N && N < 21):
          Ac = 1234;
          Bc = 0.142;
          Cc = 0.057;
          break;
        case (21 <= N && N < 52):
          Ac = 1230;
          Bc = 0.142;
          Cc = 0.058;
          break;
        case (52 <= N && N < 80):
          Ac = 1215;
          Bc = 0.144;
          Cc = 0.060;
          break;
        case (80 <= N && N < 111):
          Ac = 1186;
          Bc = 0.156;
          Cc = 0.071;
          break;
        case (111 <= N && N < 141):
          Ac = 1136;
          Bc = 0.180;
          Cc = 0.097;
          break;
        case (141 <= N && N < 172):
          Ac = 1104;
          Bc = 0.196;
          Cc = 0.121;
          break;
        case (172 <= N && N < 202):
          Ac = 1088;
          Bc = 0.205;
          Cc = 0.134;
          break;
        case (202 <= N && N < 233):
          Ac = 1085;
          Bc = 0.207;
          Cc = 0.136;
          break;
        case (233 <= N && N < 264):
          Ac = 1107;
          Bc = 0.201;
          Cc = 0.122;
          break;
        case (264 <= N && N < 294):
          Ac = 1152;
          Bc = 0.177;
          Cc = 0.092;
          break;
        case (294 <= N && N < 325):
          Ac = 1193;
          Bc = 0.160;
          Cc = 0.073;
          break;
        case (325 <= N && N < 355):
          Ac = 1221;
          Bc = 0.149;
          Cc = 0.063;
          break;
        case (355 <= N && N < 367):
          Ac = 1234;
          Bc = 0.142;
          Cc = 0.057;
          break;
      }


      var ppo = Math.pow(Math.E, (-0.1184 * Alt)); //Calculamos p/po, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
      var Idn = Ac * Math.pow(Math.E, (-ppo * (Bc / Math.sin(dtor(Beta))))); //Calculamos IDN, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
      var Id = Idn * (Tetta); //Calculamos ID, (Vease Ecuacion del tiempo2.pdf - Pg. 9) *Falta calcular Tetta*
      var Is = Cc * Idn * ((1 + Math.cos(dtor(inclinacion))) / 2); //Calculamos Is, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
      var Ir = Idn * foreground * (Cc + Math.sin(dtor(Beta))) //Calculamos Ir, (Vease Ecuacion del tiempo2.pdf - Pg. 9)
        *
        ((1 - Math.cos(dtor(inclinacion))) / 2);
      var Itot = Id + Is + Ir;
      tiempohorasx.push(TLE / 60);
      radiaciontotaly.push(Itot);
      Betas.push(Beta);
      Alphas.push(Alpha);
    }
    for (var i = 0; i < tiempohorasx.length; i++) {
      console.log("Hora: " + tiempohorasx[i] + "\n Radiacion Total: " + radiaciontotaly[i] + "\n Beta: " + Betas[i] + "\n Alpha: " + Alphas[i]);
      if (radiaciontotaly[i] < 1500) {
        datos.push({
          x: tiempohorasx[i],
          y: radiaciontotaly[i]
        })
      }
    }
    Graficar();


    var AreaBajoLaCurvaQueEsIgualALaIntegralDe6amA6pmDeLaRadiacionTotal = 120 * (radiaciontotaly[0] + 4 * radiaciontotaly[24] + radiaciontotaly[48]);
    
    document.getElementById("TotEnergia").value = AreaBajoLaCurvaQueEsIgualALaIntegralDe6amA6pmDeLaRadiacionTotal;
    
  }
}

function Graficar() {
  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Radiacion Total"
    },
    axisY: {
      includeZero: false
    },
    data: [{
      type: "line",
      dataPoints: datos
    }]
  });
  chart.render();
  document.getElementById('resultVisible').style.visibility='visible';
}