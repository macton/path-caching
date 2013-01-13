$( function() {
 
  var kMapCanvasGridSize = 25;
  var Map;
  var MapCanvas;
 
  Map = new GridMap();
  Map.Load( 'map_50x50.map', function( map ) {
    MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body') );
    webkitRequestAnimationFrame( MapCanvasUpdate );
    function MapCanvasUpdate() {
      var test_region_x = MapCanvas.MouseMapPos.x | 0;
      var test_region_y = MapCanvas.MouseMapPos.y | 0;
  
      MapCanvas.DrawFillCanvasIntoVisibleContext();
      if ( Map.IsInterior( test_region_x, test_region_y ) ) {
        MapCanvas.DrawHighlight( test_region_x, test_region_y );
      }
      MapCanvas.DrawWallsCanvasIntoVisibleContext();
      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

