// jshint esversion: 8
// jshint node: true
// jshint maxerr: 1000

"use strict";  // JavaScript code is executed in "strict mode"

/**
* @desc TwittStorm, Geosoftware 2, WiSe 2019/2020
* @author Jonathan Bahlmann, Katharina Poppinga, Benjamin Rieke, Paula Scharf
*/

// list of parameters, possibly for input checking
let paramList = "wtype, radProd, mapZoom, mapCenter, timestamp, aoi, base";

var express = require('express');
var router = express.Router();

// yaml configuration
const fs = require('fs');
const yaml = require('js-yaml');


/* GET main page.*/
router.get('/', function(req, res, next) {
  res.redirect("/map");
});


/* GET map page */
router.get('/map', function(req, res, next) {

  let paramArray = {
    "timestamp": req.query.timestamp,
    "aoi": req.query.aoi,
    "wtype": req.query.wtype,
    "rasterProduct": req.query.radProd,
    "base": req.query.base,
    "mapZoom": req.query.mapZoom,
    "mapCenter": req.query.mapCenter,
    "config": yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))
  };

  res.render('index', {
    title: 'TwittStorm',
    paramArray: paramArray
  });
});


/* GET author page */
router.get('/author', function(req, res, next) {
  res.render('author', { title: 'Author'});
});

/* GET help page */
router.get('/help', function(req, res, next) {
  res.render('help', { title: 'User Documentation'});
});

/* GET config page */
router.get('/configuration', function(req, res, next) {
  res.render('config', {
    title: 'Configuration',
    config: yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))
  });
});


/* GET animation page.*/
router.get('/animation', function(req, res, next) {

  let paramArray = {
    "timestamp": req.query.timestamp,
    "wtype": req.query.wtype,
    "rasterProduct": req.query.radProd,
    "base": req.query.base,
    "mapZoom": req.query.mapZoom,
    "mapCenter": req.query.mapCenter,
    "config": yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'))
  };

  res.render('animation', {
    title: 'TwittStorm',
    paramArray: paramArray
  });
});

module.exports = router;
