$( function() {
 
  var kMapCanvasGridSize = 25;
  var Map;
  var MapCanvas;
  var MapCanvasOptions = { 
    DrawHighlightRegion:      true, 
    DrawCorners:              true, 
    DrawHighlightDVS:         true,
    DrawPortalResultRays:     true,
    DrawPortalResultPortals:  true,
    DrawPortalResultSegments: true
  };

  Map = new GridMap();
  Map.Load( 'map_50x50.map', function( map ) {
   MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body'), MapCanvasOptions );
  });
});

