$( function() {
 
 var kMapCanvasGridSize = 25;
 var Map;
 var MapCanvas;

 Map = new GridMap();
 Map.Load( 'map_50x50.map', function( map ) {
  MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body'), { DrawHighlightRegion: true, DrawCorners: true, DrawHighlightDVS: true } );
 });
});

