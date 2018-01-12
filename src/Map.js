function Map(){
    var _geo=[];
    var _multiShootings=[];
    var _circleStyle ={
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: 50
    };
    var _circleStyle2 ={
        color: '#e17a0d',
        fillColor: '#e17a0d',
        fillOpacity: 0.1,
        radius: 50
    };
    var _circleStyle3 ={
        color: '#eac500',
        fillColor: '#eac500',
        fillOpacity: 0.1,
        radius: 50
    };

    var exports = function(selection){
        //Set the map!
        console.log('Set the Map');
        var arr = selection.datum();
        var mapid = 'mapid';
        var map;
        var current_position, current_accuracy,
            autoLocate=true;

        var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVybWlvbmV3eSIsImEiOiJjaXZ5OWI1MTYwMXkzMzFwYzNldTl0cXRoIn0.Uxs4L2MP0f58y5U-UqdWrQ', {
            id: 'mapbox.street',
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        });
        var circleLayer15 = new L.FeatureGroup();
        var circleLayer16 = new L.FeatureGroup();
        var circleLayer17 = new L.FeatureGroup();
        var shootingCircles = Array.from(arr,function(d){
            if(d.time.getYear()==117){
                d.circle = L.circle(d.location,_circleStyle)
                    .bindPopup("People Involved: " + d.num + "<br/>Street: " + d.street+"<br/>Description: " + d.description.toLowerCase()+ "<br/>Time: "+getTime(d.time)  );
                circleLayer17.addLayer(d.circle);
            } else if(d.time.getYear()==116){
                d.circle = L.circle(d.location,_circleStyle2)
                    .bindPopup("People Involved: " + d.num + "<br/>Street: " + d.street+"<br/>Description: " + d.description.toLowerCase()+ "<br/>Time: "+getTime(d.time)  );
                circleLayer16.addLayer(d.circle);
            } else if(d.time.getYear()==115){
                d.circle = L.circle(d.location,_circleStyle3)
                    .bindPopup("People Involved: " + d.num + "<br/>Street: " + d.street+"<br/>Description: " + d.description.toLowerCase()+ "<br/>Time: "+getTime(d.time)  );
                circleLayer15.addLayer(d.circle);
            }
        });
        var geojson = L.geoJson(_geo, {
            style: style,
            onEachFeature: onEachFeature
        });
            map = L.map(mapid, {
                center: [42.323, -71.072],
                zoom: 12,
                layers: [streetMap, geojson, circleLayer15, circleLayer16, circleLayer17],
                scrollWheelZoom: false
            });

            //add location button
        L.easyButton('<img src="https://unpkg.com/leaflet@1.0.3/dist/images/marker-icon.png" width="15px"/>', function(btn, map){
            map.locate();
            map.on('locationerror', onLocationError);
            map.on('locationfound', onLocationFound);
        }).addTo(map);

        var baseMaps = {
            "Street": streetMap
        };

        var overlayMaps = {
            "<span style='color: #eac500'> █  </span> 2015": circleLayer15,
            "<span style='color: #e17a0d'> █  </span> 2016": circleLayer16,
            "<span style='color: red'> █  </span> 2017": circleLayer17
        };


        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false,
            sortLayers:false,
            hideSingleBase: true,
        }).addTo(map);

        // map.locate();
        // map.on('locationerror', onLocationError);
        // map.on('locationfound', onLocationFound);

        function getTime(time) {
            var timeStr = time.toString().split(' ');
            var newTimeStr = timeStr.splice(5);
            timeStr = timeStr.join(' ');
            return timeStr;
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function style(feature) {
            return {
                fillColor: '#aaa',
                weight: 1,
                opacity: 0.7,
                color: '#815156',
                dashArray: '3',
                fillOpacity: 0.2
            };
        }

        function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                weight: 2,
                color: '#f03',
                dashArray: '',
                fillOpacity: 0.3
            });
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

//define a click listener that zooms to the strict
        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover:highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        function onLocationError(e) {
            alert(e.message);
        }


        function onLocationFound(e) {
            if (current_position) {
                map.removeLayer(current_position);
                map.removeLayer(current_accuracy);
            }
            var position = [e.latitude, e.longitude];

            if (inBoston(position)) {
                //user is in Boston, relocate and zoom in
                var radius = 100;
                map.setView(position, 14.5);
                current_position = L.marker(e.latlng).addTo(map)
                    .bindPopup("See all the shootings within " + radius + " meters from your location since June 2015.").openPopup();
                current_accuracy = L.circle(e.latlng, radius).addTo(map);
            }
        }
        function inBostonBounds(position) {
            var inBoston = false;
            var cityHall= [42.3604, -71.0580];
            var BostonBounds=L.latLngBounds(cityHall, cityHall);
            for(var g=0; g < _geo.features.length; g++ ){
                var polyCoordinates = _geo.features[g].geometry.coordinates;
                for (var p in polyCoordinates){
                    BostonBounds.extend(L.latLngBounds(polyCoordinates[p]));
                }
            }
            if(BostonBounds.contains(position)){
                inBoston=true;
            }
            return inBoston;
        }

        function inBoston(position) {
            var inBoston=false;
            var results = leafletPip.pointInLayer(L.latLng(position[0], position[1]), geojson);
            if (results.length){
                inBoston = true;
            }
            return inBoston;
        }
    }

    exports.multiShootings = function(_){
        if(!arguments.length) return _multiShootings;
        _multiShootings = _;
        return this;
    }
    exports.geoData = function(_){
        if(!arguments.length) return _geo;
        _geo = _;
        return this;
    }
    return exports;
}
