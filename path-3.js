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
      var i;
  
      MapCanvas.DrawFillCanvasIntoVisibleContext();
      if ( Map.IsInterior( test_region_x, test_region_y ) ) {
        dvs = Map.GetDVS( test_region_x, test_region_y );
        for (y=dvs.min_y;y<=dvs.max_y;y++) {
          for (x=dvs.range[y].min_x;x<=dvs.range[y].max_x;x++) {
             MapCanvas.DrawHighlight( x, y );
          }
        }
        for (i=0;i<dvs.portals.top.length;i++) { 
          MapCanvas.DrawPortalTop( dvs.portals.top[i].x, dvs.portals.top[i].y );
        }
        for (i=0;i<dvs.portals.bottom.length;i++) { 
          MapCanvas.DrawPortalBottom( dvs.portals.bottom[i].x, dvs.portals.bottom[i].y );
        }
        for (i=0;i<dvs.portals.left.length;i++) { 
          MapCanvas.DrawPortalLeft( dvs.portals.left[i].x, dvs.portals.left[i].y );
        }
        for (i=0;i<dvs.portals.right.length;i++) { 
          MapCanvas.DrawPortalRight( dvs.portals.right[i].x, dvs.portals.right[i].y );
        }
      }
      MapCanvas.DrawWallsCanvasIntoVisibleContext();
      MapCanvas.DrawCornersCanvasIntoVisibleContext();
      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

