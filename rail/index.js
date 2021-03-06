var Rail = require('national-rail-darwin');
require('dotenv').config();
var rail = new Rail(process.env.DARWIN_TOKEN);

function formatServices(services, dest){
  var formattedServices = [];
  var formattedService;
  //go through each service
  for(var service of services){
    formattedService = {
      departureTime: service.std,
      delay: service.etd,
      platform: service.platform,
    };
    //go through the next stops
    for(var stop of service.subsequentCallingPoints){
      //if train stops at dest add to list
      if(stop.crs === dest){
        formattedService.arrivalTime = stop.st;
        formattedService.arrivalDelay = stop.et;
        formattedServices.push(formattedService);
        break;
      }
    }
  }

  return formattedServices;
}

//Finds all trains leaving departure station that visit destination station.
//Gives list with departure time, delay and platform
module.exports.findDeparturesTo = (dep, dest)=>{
  //dep: Departure station CRS code
  //dest: Destination station CRS code
  return new Promise((resolve, reject)=>{
    rail.getDepartureBoardWithDetails(dep, {destination: dest, rows: 30}, function(err, result){//149 = max number of rows that can be retrieved
      if(err)
        reject(err);
      else {
        var services = formatServices(result.trainServices, dest);
        resolve({dep, dest, services});
      }
    });
  });
};