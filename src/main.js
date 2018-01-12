'use strict';
(function() {
    // global variables


    // called once on page load
    var init = function () {

    };

    // called automatically on article page resize
    window.onResize = function (width) {

    };

    // called when the graphic enters the viewport
    window.enterView = function () {

    };


    // graphic code

    var dataUrl = "https://data.boston.gov/api/3/action/datastore_search?resource_id=2968e2c0-d479-49ba-a884-4ef523ada3c0&limit=1000";
    var mapid = 'mapid';
    // var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc6jt6kk3thh2rpbd5pa6a0r/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
    //     id: 'mapbox.street',
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    // });


    // graphic code
    var typeSet = d3.set();


    d3.queue()
        .defer(d3.json, './assets/bos_neighborhoods.json')
        .defer(d3.csv, './assets/311_2018.csv', parseCSV)
        .await(function (err, geo, data) {
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
            var overlayMaps = {};
            var map = L.map(mapid, {
                center: [42.323, -71.072],
                zoom: 12,
                layers: [streetMap],
                scrollWheelZoom: false,
                zoomControl: false,
                attributionControl: false,
                doubleClickZoom: false,
                dragging: false
            });
            var circleGroup = L.layerGroup().addTo(map);

            var snowData = data.filter(function (t) {
                return t.date.getDate() == 5
            });

            // snowData.forEach(function (t) {
            //    typeSet.add(t.reason);
            //    L.circle([t.lat, t.lng]).addTo(map);
            // });
            var nestedData = d3.nest().key(function (d) {
                return d.hour;
            }).entries(snowData);

            L.control.layers(baseMaps, overlayMaps).addTo(map);

            animationCircles();
            var circlesByYear;

            d3.select('.stop-animation').on('click', function () {
                clearInterval(circlesByYear);

            });


            function animationCircles() {

                var random = getRandomNumber();

                var counter = 23;
                circleGroup.clearLayers();
                clearInterval(circlesByYear);
                var innercount = 0;

                circlesByYear = setInterval(requestByHour, 1000);

                function requestByHour() {
                    console.log(nestedData[counter]);
                    //circleGroup.clearLayers();
                    document.getElementById("showYear").innerHTML = showTimeRight(nestedData[counter].key);

                    if (counter >= 0 && nestedData[counter].values.length) {
                        //console.log(counter);
                        var innerLength = nestedData[counter].values.length; //start from 0:00
                        var step = 0;
                        var timer = setInterval(oneByone, 1000 / innerLength);

                        function oneByone() {
                            var innerObj = nestedData[counter].values[step];
                            step++;
                            if (!typeof innerObj === 'object') {
                                console.log(innerObj);
                                clearTimeout(timer);
                            } else if (innerObj) {
                                var circle = L.circleMarker([innerObj.lat, innerObj.lng], {
                                    // radius: 6,
                                    // color: '#A5C0D1',
                                    // fillColor: colorType(innerObj.reason),
                                    // weight: 1,
                                    // fillOpacity: 0.2,
                                    // opacity: 1,
                                    // className: 'objCircle'

                                    radius: 2,
                                    color: 'gold',
                                    fillColor: colorType(innerObj.reason),
                                    weight:12,
                                    fillOpacity: 0.5,
                                    opacity: 0.4,
                                    className: 'objCircle'
                                });
                                var id = +(innerObj.id.toString().slice(10));

                                circle.on('add', function () {
                                    var newRadius = 2;
                                    var currentWeight = 5, currentOpacity =0.3;
                                    var interval = setInterval(function() {
                                        currentWeight = currentWeight - 0.2;
                                        currentOpacity = currentOpacity-0.01;
                                        if (currentWeight > 0) {
                                            circle.setStyle({
                                                radius: 2,
                                                color: 'gold',
                                                weight:currentWeight,
                                                opacity: currentOpacity,
                                                fillOpacity: 0.5,
                                                fillColor: colorType(innerObj.reason)
                                            });
                                            //circle.setRadius(currentRadius);
                                        } else {
                                            circle.setStyle({
                                                radius: 2,
                                                stroke:false,
                                                fillOpacity: 0.5,
                                                fillColor: colorType(innerObj.reason)
                                            });
                                            clearTimeout(interval);
                                        }
                                    }, 40);

                                    if (random.indexOf(id) != -1) {
                                        circle.bindTooltip({
                                            permanent: true,
                                            opacity: 0.6,
                                            offset: new L.Point(100, 200)
                                        }).setTooltipContent(innerObj.case)
                                            .openTooltip();
                                    }
                                });

                                circleGroup.addLayer(circle);
                            }
                            if (step >= innerLength) {
                                //console.log('finalThishour');
                                clearTimeout(timer);
                                return;
                            }
                        }

                        if (counter == 0) {
                            clearInterval(circlesByYear);
                            console.log('counter==0');
                            setTimeout(function () {
                                console.log('settimeout1');
                                return restartAnimation();
                            }, 4000);

                            function restartAnimation() {
                                console.log('restart the loop!');
                                random = getRandomNumber();
                                circleGroup.clearLayers();
                                circlesByYear = setInterval(requestByHour, 1000);
                            }

                            counter = 23;

                            return;
                        }
                        counter--;
                    } else {
                        clearInterval(circlesByYear);
                        console.log(counter + "what happened here");
                        setTimeout(function () {
                            console.log('settimeout2');
                            circleGroup.clearLayers();
                            setInterval(requestByHour, 1000);

                        }, 4000);
                        counter = 23
                        // clearTimeout(timer);
                        // clearTimeout(circlesByYear);
                    }
                }
            }
        });

    function getRandomNumber() {
        var randomNum = [];
        for (var i = 0; i < 3; i++) {
            var j = Math.floor(100 * Math.random()); //0~999
            randomNum.push(j);
        }
        return randomNum;
    }

    function colorType(str) {
        return '#f02';
        // if(str=='Street Cleaning'){
        //         return 'steelblue'
        // } else if(str=='Code Enforcement'){
        //     return 'green'
        // } else if(str=='Sanitation'){
        //     return 'gold'
        // } else if(str =='Enforcement & Abandoned Vehicles'){
        //     return 'purple'
        // } else{
        //     return 'red'
        // }
    }

    function showTimeRight(num) {
        if(num>11){
            return (+num-11)+':00 PM'
        } else if(num>=0 && num<=11){
            return (+num+1)+':00 AM'
        } else{
            return 12+':00 AM'
        }
    }

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





// circle.on('add', function () {
//     var newRadius = 2;
//     var interval = setInterval(function() {
//         var currentRadius = circle.getRadius();
//         currentRadius = currentRadius - 0.2;
//         if (currentRadius > newRadius) {
//             circle.setStyle({
//                 radius: currentRadius,
//                 color: '#A5C0D1',
//                 fillColor: colorType(innerObj.reason),
//                 // color: colorType(innerObj.reason),
//                 fillOpacity: 0.1,
//             });
//             //circle.setRadius(currentRadius);
//         } else {
//             circle.setStyle({
//                 radius: currentRadius,
//                 stroke:false,
//                 color: colorType(innerObj.reason),
//                 fillOpacity: 0.3,
//             });
//             clearTimeout(interval);
//         }
//     }, 10);
//
//     if (random.indexOf(id) != -1) {
//         circle.bindTooltip({
//             permanent: true,
//             opacity: 0.6,
//             offset: new L.Point(100, 200)
//         }).setTooltipContent(innerObj.case)
//             .openTooltip();
//     }
// });