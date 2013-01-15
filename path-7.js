$( function() {
 
  var kMapCanvasGridSize = 25;
  var Map;
  var MapCanvas;
 
  Map = new GridMap();
  Map.Load( 'map_50x50.map', function( map ) {
    MapCanvas = new GridMapCanvas( map, kMapCanvasGridSize, $('body') );
    webkitRequestAnimationFrame( MapCanvasUpdate );
    function MapCanvasUpdate() {

      // http://www.colourlovers.com/palette/580974/Adrift_in_Dreams
      var palette       = [ '#CFF09E', '#A8DBA8', '#79BD9A', '#3B8686', '#0B486B' ]; 

      var test_x        = ( MapCanvas.MouseMapPos.x + 0.5) | 0;
      var test_y        = ( MapCanvas.MouseMapPos.y + 0.5) | 0;
      var is_corner     = Map.IsCorner( test_x, test_y );
      var tl_dvs;
      var tr_dvs;
      var bl_dvs;
      var br_dvs;
      var tl_portal_results;
      var tr_portal_results;
      var bl_portal_results;
      var br_portal_results;
      var boundary_corners = [];
      var i;
      var x;
      var y;
      var min_x;
      var min_y;
      var max_x;
      var max_y;

      //
      // Calculate results
      //

      if ( is_corner ) {
        tl_dvs            = Map.GetDVS( test_x-1, test_y-1, 0,      0,      test_x-1,    test_y-1,     Map.kTop    | Map.kLeft  );
        tr_dvs            = Map.GetDVS( test_x,   test_y-1, test_x, 0,      Map.Width-1, test_y-1,     Map.kTop    | Map.kRight );
        bl_dvs            = Map.GetDVS( test_x-1, test_y,   0,      test_y, test_x-1,    Map.Height-1, Map.kBottom | Map.kLeft  );
        br_dvs            = Map.GetDVS( test_x,   test_y,   test_x, test_y, Map.Width-1, Map.Height-1, Map.kBottom | Map.kRight );
        tl_portal_results = Map.GetVisibleThroughPortals( tl_dvs, test_x, test_y );
        tr_portal_results = Map.GetVisibleThroughPortals( tr_dvs, test_x, test_y );
        bl_portal_results = Map.GetVisibleThroughPortals( bl_dvs, test_x, test_y );
        br_portal_results = Map.GetVisibleThroughPortals( br_dvs, test_x, test_y );
        if ( tl_dvs || bl_dvs ) {
          min_x = tl_dvs ? tl_dvs.range[ test_y-1 ].min_x : test_x-1;
          min_x = bl_dvs && ( bl_dvs.range[ test_y ].min_x < min_x ) ? bl_dvs.range[ test_y ].min_x : min_x;
          for (x=test_x-1;x>=min_x;x--) {
            if ( Map.IsCorner( x, test_y ) ) {
              boundary_corners.push( {x:x, y:test_y} );
              break;
            } 
          }
        }
        if ( tr_dvs || br_dvs ) {
          max_x = tr_dvs ? tr_dvs.range[ test_y-1 ].max_x : 0;
          max_x = br_dvs && ( br_dvs.range[ test_y ].max_x > max_x ) ? br_dvs.range[ test_y ].max_x : max_x;
          for (x=test_x+1;x<=max_x+1;x++) {
            if ( Map.IsCorner( x, test_y ) ) {
              boundary_corners.push( {x:x, y:test_y} );
              break;
            } 
          }
        }
        if ( tl_dvs || tr_dvs ) {
          min_y = tl_dvs ? tl_dvs.min_y : test_y-1;
          min_y = tr_dvs && ( tr_dvs.min_y < min_y ) ? tr_dvs.min_y : min_y;
          for (y=test_y-1;y>=min_y;y--) {
            if ( Map.IsCorner( test_x, y ) ) {
              boundary_corners.push( {x:test_x, y:y} );
              break;
            } 
          }
        }
        if ( bl_dvs || br_dvs ) {
          max_y = bl_dvs ? bl_dvs.max_y : 0;
          max_y = br_dvs && ( br_dvs.max_y > max_y ) ? br_dvs.max_y : max_y;
          for (y=test_y+1;y<=max_y+1;y++) {
            if ( Map.IsCorner( test_x, y ) ) {
              boundary_corners.push( {x:test_x, y:y} );
              break;
            } 
          }
        }
      }

      // 
      // Draw results
      //

      MapCanvas.DrawFillCanvasIntoVisibleContext();

      if ( is_corner ) {
        if ( tl_dvs ) {
          for (y=tl_dvs.min_y;y<=tl_dvs.max_y;y++) {
            for (x=tl_dvs.range[y].min_x;x<=tl_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[0] );
            }
          }

          for (i=0;i<tl_portal_results.walls.length;i++) {
            x0 = tl_portal_results.walls[i].v0.x;
            y0 = tl_portal_results.walls[i].v0.y;
            x1 = tl_portal_results.walls[i].v1.x;
            y1 = tl_portal_results.walls[i].v1.y;
            x2 = test_x;
            y2 = test_y;
    
            MapCanvas.VisibleContext.strokeStyle = palette[0];
            MapCanvas.VisibleContext.fillStyle   = palette[0];
            MapCanvas.VisibleContext.lineWidth   = 1;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x2*MapCanvas.GridSize), (y2*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.fill();
            MapCanvas.VisibleContext.stroke();
          }
        }

        if ( tr_dvs ) {
          for (y=tr_dvs.min_y;y<=tr_dvs.max_y;y++) {
            for (x=tr_dvs.range[y].min_x;x<=tr_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[1] );
            }
          }

          for (i=0;i<tr_portal_results.walls.length;i++) {
            x0 = tr_portal_results.walls[i].v0.x;
            y0 = tr_portal_results.walls[i].v0.y;
            x1 = tr_portal_results.walls[i].v1.x;
            y1 = tr_portal_results.walls[i].v1.y;
            x2 = test_x;
            y2 = test_y;
    
            MapCanvas.VisibleContext.strokeStyle = palette[1];
            MapCanvas.VisibleContext.fillStyle   = palette[1];
            MapCanvas.VisibleContext.lineWidth   = 1;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x2*MapCanvas.GridSize), (y2*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.fill();
            MapCanvas.VisibleContext.stroke();
          }
        }

        if ( bl_dvs ) {
          for (y=bl_dvs.min_y;y<=bl_dvs.max_y;y++) {
            for (x=bl_dvs.range[y].min_x;x<=bl_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[2] );
            }
          }

          for (i=0;i<bl_portal_results.walls.length;i++) {
            x0 = bl_portal_results.walls[i].v0.x;
            y0 = bl_portal_results.walls[i].v0.y;
            x1 = bl_portal_results.walls[i].v1.x;
            y1 = bl_portal_results.walls[i].v1.y;
            x2 = test_x;
            y2 = test_y;
    
            MapCanvas.VisibleContext.strokeStyle = palette[2];
            MapCanvas.VisibleContext.fillStyle   = palette[2];
            MapCanvas.VisibleContext.lineWidth   = 1;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x2*MapCanvas.GridSize), (y2*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.fill();
            MapCanvas.VisibleContext.stroke();
          }
        }

        if ( br_dvs ) {
          for (y=br_dvs.min_y;y<=br_dvs.max_y;y++) {
            for (x=br_dvs.range[y].min_x;x<=br_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[3] );
            }
          }

          for (i=0;i<br_portal_results.walls.length;i++) {
            x0 = br_portal_results.walls[i].v0.x;
            y0 = br_portal_results.walls[i].v0.y;
            x1 = br_portal_results.walls[i].v1.x;
            y1 = br_portal_results.walls[i].v1.y;
            x2 = test_x;
            y2 = test_y;
    
            MapCanvas.VisibleContext.strokeStyle = palette[3];
            MapCanvas.VisibleContext.fillStyle   = palette[3];
            MapCanvas.VisibleContext.lineWidth   = 1;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.moveTo( (x0*MapCanvas.GridSize), (y0*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x1*MapCanvas.GridSize), (y1*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.lineTo( (x2*MapCanvas.GridSize), (y2*MapCanvas.GridSize) );
            MapCanvas.VisibleContext.fill();
            MapCanvas.VisibleContext.stroke();
          }
        }
      }
   
      MapCanvas.DrawWallsCanvasIntoVisibleContext();

      if ( is_corner ) {
        x = test_x;
        y = test_y;
        MapCanvas.VisibleContext.fillStyle = 'rgb(255,255,0)';
        MapCanvas.VisibleContext.beginPath();
        MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
        MapCanvas.VisibleContext.fill();

        if ( tl_dvs ) {
          MapCanvas.VisibleContext.fillStyle = 'rgb(255,255,255)';
          for (i=0;i<tl_portal_results.corners.length;i++) {
            x = tl_portal_results.corners[i].x;
            y = tl_portal_results.corners[i].y;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
            MapCanvas.VisibleContext.fill();
          }
        }

        if ( tr_dvs ) {
          MapCanvas.VisibleContext.fillStyle = 'rgb(255,255,255)';
          for (i=0;i<tr_portal_results.corners.length;i++) {
            x = tr_portal_results.corners[i].x;
            y = tr_portal_results.corners[i].y;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
            MapCanvas.VisibleContext.fill();
          }
        }

        if ( bl_dvs ) {
          MapCanvas.VisibleContext.fillStyle = 'rgb(255,255,255)';
          for (i=0;i<bl_portal_results.corners.length;i++) {
            x = bl_portal_results.corners[i].x;
            y = bl_portal_results.corners[i].y;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
            MapCanvas.VisibleContext.fill();
          }
        }

        if ( br_dvs ) {
          MapCanvas.VisibleContext.fillStyle = 'rgb(255,255,255)';
          for (i=0;i<br_portal_results.corners.length;i++) {
            x = br_portal_results.corners[i].x;
            y = br_portal_results.corners[i].y;
            MapCanvas.VisibleContext.beginPath();
            MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
            MapCanvas.VisibleContext.fill();
          }
        }

        MapCanvas.VisibleContext.fillStyle = 'rgb(255,128,255)';
        for (i=0;i<boundary_corners.length;i++) {
          x = boundary_corners[i].x;
          y = boundary_corners[i].y;
          MapCanvas.VisibleContext.beginPath();
          MapCanvas.VisibleContext.arc(x*MapCanvas.GridSize, y*MapCanvas.GridSize, 8, 0, 2 * Math.PI, true);
          MapCanvas.VisibleContext.fill();
        }
      }

      MapCanvas.DrawCornersCanvasIntoVisibleContext();

      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

