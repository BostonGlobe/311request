'use strict';
(function() {
	// global variables



	// called once on page load
	var init = function() {

	};

	// called automatically on article page resize
	window.onResize = function(width) {

	};

	// called when the graphic enters the viewport
	window.enterView = function() {

	};


	// graphic code

    var dataUrl="https://data.boston.gov/api/3/action/datastore_search?resource_id=2968e2c0-d479-49ba-a884-4ef523ada3c0&limit=1000";
    var mapid = 'mapid';
    // var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc6jt6kk3thh2rpbd5pa6a0r/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
    //     id: 'mapbox.street',
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    // });


    // graphic code
	var typeSet = d3.set();
    var random = [];
    for (var i=0; i<30; i++){
        var j= Math.floor(1000* Math.random()); //0~999
        random.push(j);
    }
    console.log(random); // 30 random numbers 0~999

	d3.queue()
		.defer(d3.json, './assets/bos_neighborhoods.json')
		.defer(d3.csv, './assets/311_2018.csv', parseCSV)
		.await(function(err, geo, data) {
			console.log(geo);
			console.log(data);


            var streetMap = L.geoJSON(geo, {
            	style: function (d) {
					return {
                        weight: 1,
                        opacity: 1,
                        color: 'darkgrey',
                        dashArray: '3',
                        fillOpacity: 0
                    }
                }
			});
            var baseMaps = {
                "Street": streetMap
            };
            var overlayMaps={};
            var map = L.map(mapid, {
                center: [42.323, -71.072],
                zoom: 12,
                layers: [streetMap],
                scrollWheelZoom: false,
				zoomControl: false,
				attributionControl:false,
            });
            var circleGroup = L.layerGroup().addTo(map);

			var snowData = data.filter(function (t) {
				return t.date.getDate()==5
			});

			// snowData.forEach(function (t) {
             //    typeSet.add(t.reason);
             //    L.circle([t.lat, t.lng]).addTo(map);
			// });
            console.log(typeSet.values());
			console.log(snowData);
            var nestedData = d3.nest().key(function (d) {
                return d.hour;
            }).entries(snowData);

			console.log(nestedData);

            L.control.layers(baseMaps, overlayMaps).addTo(map);

            animationCircles();

            function animationCircles() {
                var counter =23;
                circleGroup.clearLayers();
                clearInterval(circlesByYear);

                var circlesByYear = setInterval(function () {

                    circleGroup.eachLayer(function (layer) {
                        layer.setStyle({opacity: 0.1});
                        // console.log(layer.isTooltipOpen());
                        // console.log(layer);
                    });

					console.log(nestedData[counter]);
                    //circleGroup.clearLayers();
                    document.getElementById("showYear").innerHTML = nestedData[counter].key;
                    if(counter>=0){
                        //console.log(counter);
                        nestedData[counter].values.forEach(
                            function (obj) {

                                if(obj.lat){
                                    var circle = L.circleMarker([obj.lat, obj.lng], {
                                        radius: 2,
                                        color: 'red',
                                        weight: 2,
                                        fillOpacity: 0.2,
                                        className:'objCircle'
                                    });

									//101002306662
									var id = +(obj.id.toString().slice(9));

									if(random.indexOf(id)!=-1){
                                        circle.on('add', function () {
                                            circle.bindTooltip({permanent: true, opacity: 0.3, offset: new L.Point(100, 200)})
                                                .setTooltipContent(obj.case).openTooltip();
                                        });
									}
                                    circleGroup.addLayer(circle);
                                }
                            }
                        );
                        counter--;
                        if(counter==0){
                            //counter = 23;
                        	clearTimeout(circlesByYear);
                        }
                    } else{
                        clearTimeout(circlesByYear);
						//counter = 23;
                    }
                }, 1000);
            }
		});





	function parseCSV(d) {
		return {
			case: d['CASE_TITLE'],
			department: d['Department'],
			location: d['Location'],
			lat: +d.Latitude,
			lng: +d.Longitude,
			reason: d['REASON'],
			type: d['TYPE'],
			neighborhood: d.neighborhood,
			date: parseTime(d['open_dt']),
			hour: +(d['open_dt'].split(' ')[1].split(':')[0]),
			id: +(d['CASE_ENQUIRY_ID'])
		}
    }

    function parseTime(str) {
		var m = +str.split('/')[0]-1,
			y = 2018,
			d = +str.split('/')[1],
			h = str.split(' ')[1].split(':')[0],
			minute = str.split(' ')[1].split(':')[1];
		return new Date(y, m, d, h, minute);
    }


	// run code
	init();
})();
