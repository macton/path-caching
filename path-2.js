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
      var dvs;
      var x;
      var y;
  
      MapCanvas.DrawFillCanvasIntoVisibleContext();
      if ( Map.IsInterior( test_region_x, test_region_y ) ) {
        dvs = Map.GetDVS( test_region_x, test_region_y );
        for (y=dvs.min_y;y<=dvs.max_y;y++) {
          for (x=dvs.range[y].min_x;x<=dvs.range[y].max_x;x++) {
             MapCanvas.DrawHighlight( x, y );
          }
        }
      }
      MapCanvas.DrawWallsCanvasIntoVisibleContext();
      MapCanvas.DrawCornersCanvasIntoVisibleContext();
      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

