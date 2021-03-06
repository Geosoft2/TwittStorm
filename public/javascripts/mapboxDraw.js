// jshint esversion: 8
// jshint maxerr: 1000

"use strict";  // JavaScript code is executed in "strict mode"

/**
* @desc TwittStorm, Geosoftware 2, WiSe 2019/2020
* @author Jonathan Bahlmann, Katharina Poppinga, Benjamin Rieke, Paula Scharf
*/



/**
* @desc Processes drawn, updated and deleted mapbox-draw-polygons in the given map and starts tweets-search.
* Writes drawn polygons-coordinates into URL. It is only possible to have one drawn polygon at a time.
* @author Katharina Poppinga
* @param {Object} map mapbox-map in which the polygons shall be drawn
* @param {Object} draw - the former created MapboxDraw-Object which enables drawing polygons in the map
*/
function drawForAOI(map, draw) {

	// ************************ events for drawn polygons ************************
	// https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md

	// if a polygon is drawn ...
	map.on('draw.create', function (e) {

		let data = draw.getAll(); // all currently drawn polygons
		let pids = [];

		// ID of the added feature
		const lid = data.features[data.features.length - 1].id;

		data.features.forEach((f) => {
			if (f.geometry.type === 'Polygon' && f.id !== lid) {
				pids.push(f.id)
			}
		});
		draw.delete(pids);

		// move weather-layerIDs on top of the drawn AOI to be able to open popups for the warnings onclick
		for (let i = 1; i < customLayerIds.length; i++) {
			map.moveLayer(customLayerIds[i]);
		}

		// write AOI into URL and start Tweet-Search
		processingAOI(map, e.features[0].geometry.coordinates);
	});


	// if a polygon is deleted ...
	map.on('draw.delete', function (e) {

		deleteFromURL("aoi");
		showAllExcept(map, "tweet");
	});


	// if a polygon is edited/updated ...
	map.on('draw.update', function (e) {
		// write AOI into URL and start Tweet-Search
		processingAOI(map, e.features[0].geometry.coordinates);
	});


	map.on('draw.modechange', function (e) {
		popupsEnabled = (e.mode !== "draw_polygon");
	});


	map.on('draw.reloadTweets', function () {
		if (readURL("aoi") !== false) {
			doneProcessingAOI = false;
			let polygons = draw.getAll();
			if (polygons.features[0]) {
				let attr = readURL("wtype");
				if (attr === "warnings") {
					onlyShowUnwetterAndTweetsInPolygon(map, turf.polygon(polygons.features[0].geometry.coordinates));
				} else {
					let prod = readURL("radProd");
					onlyShowRainRadarAndTweetsInPolygon(map, turf.polygon(polygons.features[0].geometry.coordinates), prod);
				}
			}
		}
	})
}



/**
* @desc Writes coordinates of drawn polygon into URL and
* starts the tweet-search for warnings or radar data located in the drawn polygon.
* @author Katharina Poppinga
* @private
* @param {Object} map mapbox-map
* @param {Array} aoiCoordinatesGeoJSON - coordinates of drawn polygon (in format part of a GeoJSON)
*/
function processingAOI(map, aoiCoordinatesGeoJSON) {
	doneProcessingAOI = false;

	let coordinatesAOI = aoiCoordinatesGeoJSON[0];

	// *************************************************************************
	// putting together the AOI-string for URL (for permalink-functionality) and write this AOI-string into URL:
	let aoiString =	"[[" + coordinatesAOI[0].toString() + "]";

	for (let i = 1; i < coordinatesAOI.length; i++) {
		aoiString = aoiString + ",[" + coordinatesAOI[i].toString() + "]";
	}
	aoiString = aoiString + "]";

	updateURL("aoi", aoiString);
	// *************************************************************************

	zoomToCoordinates(map, coordinatesAOI);

	// do tweet-search
	let attr = readURL("wtype");
	let prod = readURL("radProd");
	if (attr === "warnings") {
		onlyShowUnwetterAndTweetsInPolygon(map, turf.polygon(aoiCoordinatesGeoJSON));
	} else {
		onlyShowRainRadarAndTweetsInPolygon(map, turf.polygon(aoiCoordinatesGeoJSON), prod);
	}
}
