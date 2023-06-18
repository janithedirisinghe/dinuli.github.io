// convert epochtime to JavaScripte Date object

function epochToJsDate(epochTime){
    return new Date(epochTime*1000);
  }
  
  // convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime){
  var epochDate = new Date(epochToJsDate(epochTime)-64800000);
  var dateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);

  return dateTime;
}

   // function to plot values on charts
  function plotValues(chart, timestamp, value){
    var x = (epochToJsDate(timestamp).getTime()) + 64800000;
    var y = Number (value);
    if(chart.series[0].data.length > 40) {
      chart.series[0].addPoint([x, y], true, true, true);
    } else {
      chart.series[0].addPoint([x, y], true, false, true);
    }
  }
  
  // DOM elements


  // JavaScript code to calculate tank volume based on the given formula

  const tankLengthInput = document.getElementById('tank-length');
  const tankDiameterInput = document.getElementById('tank-diameter');
  const sensorHeightInput = document.getElementById('sensor-height');
  const fuelVolumeDisplay = document.getElementById('fuel-volume');

  var tankLength = parseFloat(tankLengthInput.value);
  var tankDiameter = parseFloat(tankDiameterInput.value);
  var tankRadius = tankDiameter / 2;
  var sensorHeight =0;
  var tankVolume = calculateTankVolume(tankLength, tankRadius, sensorHeight);



  const loginElement = document.querySelector('#login-form');
  const contentElement = document.querySelector("#content-sign-in");
  const userDetailsElement = document.querySelector('#user-details');
  const authBarElement = document.querySelector('#authentication-bar');
  const deleteButtonElement = document.getElementById('delete-button');
  const deleteModalElement = document.getElementById('delete-modal');
  const deleteDataFormElement = document.querySelector('#delete-data-form');
  const viewDataButtonElement = document.getElementById('view-data-button');
  const hideDataButtonElement = document.getElementById('hide-data-button');
  const tableContainerElement = document.querySelector('#table-container');
  const chartsRangeInputElement = document.getElementById('charts-range');
  const loadDataButtonElement = document.getElementById('load-data');
  const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
  const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
  const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');
  
  // DOM elements for sensor readings
  const cardsReadingsElement = document.querySelector("#cards-div");
  const gaugesReadingsElement = document.querySelector("#gauges-div");
  const chartsDivElement = document.querySelector('#charts-div');
  const tempElement = document.getElementById("temp");
  const humElement = document.getElementById("hum");
  const presElement = document.getElementById("pres");
  const updateElement = document.getElementById("lastUpdate")

  var hdt=0;
  var vol;
  
  // Function to calculate tank volume based on the given formula
  function calculateTankVolume(length, radius, height) {
    height=parseFloat(height);
    var nheight= (2*radius) - height;
    var volume = ( (Math.pow(radius, 2) * (  Math.acos((radius-nheight) / radius))-Math.sqrt(2 * nheight * radius - Math.pow(nheight, 2)) * (radius-nheight)) ) * length;
    vol=volume.toFixed(2);
    return vol;
    }
  // Function to calculate tank volume parsentage based on the given formula 
  
  function calculateTankVolumeparsentage(length, radius, height) {
     tankLength = parseFloat(tankLengthInput.value);
     tankDiameter = parseFloat(tankDiameterInput.value);
     tankRadius = tankDiameter / 2;

      height=parseFloat(height);
      var nheight= (2*radius) - height;
      var volume = ( (Math.pow(radius, 2) * (  Math.acos((radius-nheight) / radius))-Math.sqrt(2 * nheight * radius - Math.pow(nheight, 2)) * (radius-nheight)) ) * length;

      var per = ((volume / (Math.PI * tankRadius * tankRadius*tankLength)) * 100).toFixed(2);
      return per;
    }
  
  // MANAGE LOGIN/LOGOUT UI
  const setupUI = (user) => {
    if (user) {
      //toggle UI elements
      loginElement.style.display = 'none';
      contentElement.style.display = 'block';
      authBarElement.style.display ='block';
      userDetailsElement.style.display ='block';
      userDetailsElement.innerHTML = user.email;
  
      // get user UID to get data from database
      var uid = user.uid;
      console.log(uid);
  
      // Database paths (with user UID)
      var dbPath = 'UsersData/' + uid.toString() + '/readings';
      var chartPath = 'UsersData/' + uid.toString() + '/charts/range';
  
      // Database references
      var dbRef = firebase.database().ref(dbPath);
      var chartRef = firebase.database().ref(chartPath);
  
      // CHARTS
      // Number of readings to plot on charts
      var chartRange = 0;
      // Get number of readings to plot saved on database (runs when the page first loads and whenever there's a change in the database)
      chartRef.on('value', snapshot =>{
        chartRange = Number(snapshot.val());
        console.log(chartRange);
        // Delete all data from charts to update with new values when a new range is selected
        chartT.destroy();
        chartH.destroy();
        chartP.destroy();
        // Render new charts to display new range of data
        chartT = createTemperatureChart();
        chartH = createHumidityChart();
        chartP = createPressureChart();
        // Update the charts with the new range
        // Get the latest readings and plot them on charts (the number of plotted readings corresponds to the chartRange value)
        dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot =>{
          var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, hight: 5.20, pressure: 1008.48, timestamp:1641317355}
          // Save values on variables
          var temperature = jsonData.temperature;
          var hight = jsonData.hight;
          hdt = hight;
          console.log(hdt);
          var pressure = jsonData.pressure;
          var timestamp = jsonData.timestamp;
          // Plot the values on the charts
          plotValues(chartT, timestamp, temperature);
          plotValues(chartH, timestamp, hight);
          plotValues(chartP, timestamp, pressure);
        });
      });
  
      // Update database with new range (input field)
      chartsRangeInputElement.onchange = () =>{
        chartRef.set(chartsRangeInputElement.value);
      };
  
      //CHECKBOXES
      // Checbox (cards for sensor readings)
      cardsCheckboxElement.addEventListener('change', (e) =>{
        if (cardsCheckboxElement.checked) {
          cardsReadingsElement.style.display = 'block';
        }
        else{
          cardsReadingsElement.style.display = 'none';
        }
      });
      // Checbox (gauges for sensor readings)
      gaugesCheckboxElement.addEventListener('change', (e) =>{
        if (gaugesCheckboxElement.checked) {
          gaugesReadingsElement.style.display = 'block';
        }
        else{
          gaugesReadingsElement.style.display = 'none';
        }
      });
      // Checbox (charta for sensor readings)
      chartsCheckboxElement.addEventListener('change', (e) =>{
        if (chartsCheckboxElement.checked) {
          chartsDivElement.style.display = 'block';
        }
        else{
          chartsDivElement.style.display = 'none';
        }
      });
  
      // CARDS
      // Get the latest readings and display on cards
      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, hight: 5.20, pressure: 1008.48, timestamp:1641317355}
        var temperature = jsonData.temperature;
        var hight = jsonData.hight;
        var pressure = jsonData.pressure;
        var timestamp = jsonData.timestamp;
        tankLength = parseFloat(tankLengthInput.value);
        tankDiameter = parseFloat(tankDiameterInput.value);
        tankRadius = tankDiameter / 2;
        
        // Update DOM elements
        tempElement.innerHTML = temperature;
        humElement.innerHTML = calculateTankVolume(tankLength, tankRadius, hight);
        presElement.innerHTML = pressure;
        updateElement.innerHTML = epochToDateTime(timestamp);
      });
  
      // GAUGES
      // Get the latest readings and display on gauges
      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, hight: 5.20, pressure: 1008.48, timestamp:1641317355}
        var temperature = jsonData.temperature;
        var hight = jsonData.hight;
        var pressure = jsonData.pressure; 
        var timestamp = jsonData.timestamp;
        tankLength = parseFloat(tankLengthInput.value);
        tankDiameter = parseFloat(tankDiameterInput.value);
        tankRadius = tankDiameter / 2;
        // Update DOM elements
        var gaugeT = createTemperatureGauge();
        var gaugeH = createHumidityGauge();
        gaugeT.draw();
        gaugeH.draw();
        gaugeT.value = temperature;
        gaugeH.value = calculateTankVolumeparsentage(tankLength, tankRadius, hight);
        updateElement.innerHTML = epochToDateTime(timestamp);
      });
  
      // DELETE DATA
      // Add event listener to open modal when click on "Delete Data" button
      deleteButtonElement.addEventListener('click', e =>{
        console.log("Remove data");
        e.preventDefault;
        deleteModalElement.style.display="block";
      });
  
      // Add event listener when delete form is submited
      deleteDataFormElement.addEventListener('submit', (e) => {
        // delete data (readings)
        dbRef.remove();
      });
  
      // TABLE
      var lastReadingTimestamp; //saves last timestamp displayed on the table
      // Function that creates the table with the first 100 readings
      function createTable(){
        // append all data to the table
        var firstRun = true;
        dbRef.orderByKey().limitToLast(100).on('child_added', function(snapshot) {
          if (snapshot.exists()) {
            var jsonData = snapshot.toJSON();
            console.log(jsonData);
            var temperature = jsonData.temperature;
            var hight = jsonData.hight;
            var pressure = jsonData.pressure;
            var timestamp = jsonData.timestamp;
            tankLength = parseFloat(tankLengthInput.value);
            tankDiameter = parseFloat(tankDiameterInput.value);
            tankRadius = tankDiameter / 2;
            var content = '';
            content += '<tr>';
            content += '<td>' + epochToDateTime(timestamp) + '</td>';
            content += '<td>' + temperature + '</td>';
            //content += '<td>' + vol.toFixed(2) + '</td>';
            content += '<td>' + calculateTankVolume(tankLength, tankRadius, hight) + '</td>';
            //content += '<td>' + calculateTankVolumeparsentage(tankLength, tankRadius, humidity);
            content += '<td>' + pressure + '</td>';
            content += '</tr>';
            $('#tbody').prepend(content);
            // Save lastReadingTimestamp --> corresponds to the first timestamp on the returned snapshot data
            if (firstRun){
              lastReadingTimestamp = timestamp;
              firstRun=false;
              console.log(lastReadingTimestamp);
            }
          }
        });
      };
  
      // append readings to table (after pressing More results... button)
      function appendToTable(){
        var dataList = []; // saves list of readings returned by the snapshot (oldest-->newest)
        var reversedList = []; // the same as previous, but reversed (newest--> oldest)
        console.log("APEND");
        dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function(snapshot) {
          // convert the snapshot to JSON
          if (snapshot.exists()) {
            snapshot.forEach(element => {
              var jsonData = element.toJSON();
              dataList.push(jsonData); // create a list with all data
            });
            lastReadingTimestamp = dataList[0].timestamp; //oldest timestamp corresponds to the first on the list (oldest --> newest)
            reversedList = dataList.reverse(); // reverse the order of the list (newest data --> oldest data)
  
            var firstTime = true;
            // loop through all elements of the list and append to table (newest elements first)
            reversedList.forEach(element =>{
              if (firstTime){ // ignore first reading (it's already on the table from the previous query)
                firstTime = false;
              }
              else{
                var temperature = element.temperature;
                var hight = element.hight;
                var pressure = element.pressure;
                var timestamp = element.timestamp;
                tankLength = parseFloat(tankLengthInput.value);
                tankDiameter = parseFloat(tankDiameterInput.value);
                tankRadius = tankDiameter / 2;
                var content = '';
                content += '<tr>';
                content += '<td>' + epochToDateTime(timestamp) + '</td>';
                content += '<td>' + temperature + '</td>';
                //content += '<td>' + vol.toFixed(2) + '</td>';
                content += '<td>' + calculateTankVolume(tankLength, tankRadius, hight) + '</td>';
                content += '<td>' + pressure + '</td>';
                content += '</tr>';
                $('#tbody').append(content);
              }
            });
          }
        });
      }
  
      viewDataButtonElement.addEventListener('click', (e) =>{
        // Toggle DOM elements
        tableContainerElement.style.display = 'block';
        viewDataButtonElement.style.display ='none';
        hideDataButtonElement.style.display ='inline-block';
        loadDataButtonElement.style.display = 'inline-block'
        createTable();
      });
  
      loadDataButtonElement.addEventListener('click', (e) => {
        appendToTable();
      });
  
      hideDataButtonElement.addEventListener('click', (e) => {
        tableContainerElement.style.display = 'none';
        viewDataButtonElement.style.display = 'inline-block';
        hideDataButtonElement.style.display = 'none';
      });
    


      //fuelVolumeDisplay.innerHTML = `Current fuel volume: ${tankVolume} cubic meters`;
      //setInterval(function() {tha
      // Simulate sensor reading - replace this with actual code to read sensor data
      // Save values on variables
      //sensorHeight =hdt; //Math.random() * tankRadius;
      //sensorHeightInput.value = sensorHeight.toFixed(2);
      //sensorHeightInput.value = sensorHeight;
      //tankLength = parseFloat(tankLengthInput.value);
      //tankDiameter = parseFloat(tankDiameterInput.value);
      //tankRadius = tankDiameter / 2;

      //tankVolume = calculateTankVolume(tankLength, tankRadius, sensorHeight);
      //fuelVolumeDisplay.innerHTML = `Current fuel volume: ${tankVolume} cubic meters`;
      //}, 1000);
  

    // IF USER IS LOGGED OUT
    } else{
      // toggle UI elements
      loginElement.style.display = 'block';
      authBarElement.style.display ='none';
      userDetailsElement.style.display ='none';
      contentElement.style.display = 'none';
    }
  }




