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
      MapCanvas.DrawWallsCanvasIntoVisibleContext();
      if ( Map.IsInterior( test_region_x, test_region_y ) ) {
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
    
          is_left_outer_wall   = (x0 == 0) && (x1 == 0);
          is_right_outer_wall  = (x0 == MapCanvas.Map.Width) && (x1 == MapCanvas.Map.Width);
          is_top_outer_wall    = (y0 == 0) && (y1 == 0);
          is_bottom_outer_wall = (y0 == MapCanvas.Map.Height) && (y1 == MapCanvas.Map.Height);
          is_outer_wall        = is_left_outer_wall || is_right_outer_wall || is_top_outer_wall || is_bottom_outer_wall;
    
          MapCanvas.VisibleContext.strokeStyle = 'rgb(255,255,255)';
          MapCanvas.VisibleContext.lineWidth   = is_outer_wall ? 4 : 2;
          MapCanvas.VisibleContext.lineCap     = 'round'
    
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.stroke();
    
          MapCanvas.VisibleContext.strokeStyle = 'rgb(255,255,128)';
          MapCanvas.VisibleContext.lineWidth   = 2;
          MapCanvas.VisibleContext.lineCap     = 'round'
    
          x0 = test_x;
          y0 = test_y;
          x1 = portal_results.walls[i].v0.x;
          y1 = portal_results.walls[i].v0.y;
    
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.stroke();
    
          x0 = test_x;
          y0 = test_y;
          x1 = portal_results.walls[i].v1.x;
          y1 = portal_results.walls[i].v1.y;
    
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.stroke();
        }

        for (i=0;i<portal_results.portals.length;i++) {
          MapCanvas.VisibleContext.strokeStyle = 'rgb(0,255,0)';
          MapCanvas.VisibleContext.lineWidth   = 4;
          MapCanvas.VisibleContext.lineCap     = 'butt'
    
          x0 = portal_results.portals[i].v0.x;
          y0 = portal_results.portals[i].v0.y;
          x1 = portal_results.portals[i].v1.x;
          y1 = portal_results.portals[i].v1.y;
    
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
          MapCanvas.VisibleContext.stroke();
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
      MapCanvas.DrawCornersCanvasIntoVisibleContext();
      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

