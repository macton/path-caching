$( function() {
 
  var kMapCanvasGridSize = 25;
  var Map;
  var MapCanvas;
 
  Map = new GridMap();
  Map.Load( 'map_50x50.map', function( map ) {
    MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body') );
    webkitRequestAnimationFrame( MapCanvasUpdate );
    function MapCanvasUpdate() {
      var test_x        = MapCanvas.MouseMapPos.x;
      var test_y        = MapCanvas.MouseMapPos.y;
      var test_region_x = MapCanvas.MouseMapPos.x | 0;
      var test_region_y = MapCanvas.MouseMapPos.y | 0;
      var is_interior   = Map.IsInterior( test_region_x, test_region_y );
      var dvs;
      var portal_results;
      var x;
      var y;
      var i;
      var x0;
      var y0;
      var x1;
      var y1;
  
      MapCanvas.DrawFillCanvasIntoVisibleContext();

      if ( is_interior ) {
        dvs            = Map.GetDVS( test_region_x, test_region_y );
        portal_results = Map.GetVisibleThroughPortals( test_x, test_y, test_region_x, test_region_y );

        for (y=dvs.min_y;y<=dvs.max_y;y++) {
          for (x=dvs.range[y].min_x;x<=dvs.range[y].max_x;x++) {
             MapCanvas.DrawHighlight( x, y );
          }
        }
        for (i=0;i<portal_results.walls.length;i++) {
          x0 = portal_results.walls[i].v0.x;
          y0 = portal_results.walls[i].v0.y;
          x1 = portal_results.walls[i].v1.x;
          y1 = portal_results.walls[i].v1.y;
          x2 = test_x;
          y2 = test_y;
    
          MapCanvas.VisibleContext.strokeStyle = 'rgb(255,255,255)';
          MapCanvas.VisibleContext.fillStyle   = 'rgb(255,255,255)';
          MapCanvas.VisibleContext.lineWidth   = 1;
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x2*MapCanvas.GridSize), (y2*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.fill();
          MapCanvas.VisibleContext.stroke();
        }
      }

      MapCanvas.DrawWallsCanvasIntoVisibleContext();

      if ( is_interior ) {
        MapCanvas.VisibleContext.fillStyle = 'rgb(255,0,255)';
        for (i=0;i<portal_results.corners.length;i++) {
          x = portal_results.corners[i].x;
          y = portal_results.corners[i].y;
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 4, 0, 2 * Math.PI, true);
          MapCanvas.VisibleContext.fill();
        }
      }

      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

