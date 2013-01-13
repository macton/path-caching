$( function() {
 
  var kMapCanvasGridSize = 25;
  var Map;
  var MapCanvas;
  var MapCanvasOptions = { 
    DrawHighlightDVS:        true,
    DrawPortalResultSolid:   true,
    DrawPortalResultCorners: true
  };

  Map = new GridMap();
  Map.Load( 'map_50x50.map', function( map ) {
   MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body'), MapCanvasOptions );
  });
});

