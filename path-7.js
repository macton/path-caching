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
      var x;
      var y;

      MapCanvas.DrawFillCanvasIntoVisibleContext();

      if ( is_corner ) {
        tl_dvs = Map.GetDVS( test_x-1, test_y-1, 0,      0,      test_x-1,    test_y-1,     Map.kTop    | Map.kLeft  );
        tr_dvs = Map.GetDVS( test_x,   test_y-1, test_x, 0,      Map.Width-1, test_y-1,     Map.kTop    | Map.kRight );
        bl_dvs = Map.GetDVS( test_x-1, test_y,   0,      test_y, test_x-1,    Map.Height-1, Map.kBottom | Map.kLeft  );
        br_dvs = Map.GetDVS( test_x,   test_y,   test_x, test_y, Map.Width-1, Map.Height-1, Map.kBottom | Map.kRight );

        if ( tl_dvs ) {
          for (y=tl_dvs.min_y;y<=tl_dvs.max_y;y++) {
            for (x=tl_dvs.range[y].min_x;x<=tl_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[0] );
            }
          }
          for (i=0;i<tl_dvs.portals.top.length;i++) { 
            MapCanvas.DrawPortalTop( tl_dvs.portals.top[i].x, tl_dvs.portals.top[i].y );
          }
          for (i=0;i<tl_dvs.portals.bottom.length;i++) { 
            MapCanvas.DrawPortalBottom( tl_dvs.portals.bottom[i].x, tl_dvs.portals.bottom[i].y );
          }
          for (i=0;i<tl_dvs.portals.left.length;i++) { 
            MapCanvas.DrawPortalLeft( tl_dvs.portals.left[i].x, tl_dvs.portals.left[i].y );
          }
          for (i=0;i<tl_dvs.portals.right.length;i++) { 
            MapCanvas.DrawPortalRight( tl_dvs.portals.right[i].x, tl_dvs.portals.right[i].y );
          }
        }

        if ( tr_dvs ) {
          for (y=tr_dvs.min_y;y<=tr_dvs.max_y;y++) {
            for (x=tr_dvs.range[y].min_x;x<=tr_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[1] );
            }
          }
          for (i=0;i<tr_dvs.portals.top.length;i++) { 
            MapCanvas.DrawPortalTop( tr_dvs.portals.top[i].x, tr_dvs.portals.top[i].y );
          }
          for (i=0;i<tr_dvs.portals.bottom.length;i++) { 
            MapCanvas.DrawPortalBottom( tr_dvs.portals.bottom[i].x, tr_dvs.portals.bottom[i].y );
          }
          for (i=0;i<tr_dvs.portals.left.length;i++) { 
            MapCanvas.DrawPortalLeft( tr_dvs.portals.left[i].x, tr_dvs.portals.left[i].y );
          }
          for (i=0;i<tr_dvs.portals.right.length;i++) { 
            MapCanvas.DrawPortalRight( tr_dvs.portals.right[i].x, tr_dvs.portals.right[i].y );
          }
        }

        if ( bl_dvs ) {
          for (y=bl_dvs.min_y;y<=bl_dvs.max_y;y++) {
            for (x=bl_dvs.range[y].min_x;x<=bl_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[2] );
            }
          }
          for (i=0;i<bl_dvs.portals.top.length;i++) { 
            MapCanvas.DrawPortalTop( bl_dvs.portals.top[i].x, bl_dvs.portals.top[i].y );
          }
          for (i=0;i<bl_dvs.portals.bottom.length;i++) { 
            MapCanvas.DrawPortalBottom( bl_dvs.portals.bottom[i].x, bl_dvs.portals.bottom[i].y );
          }
          for (i=0;i<bl_dvs.portals.left.length;i++) { 
            MapCanvas.DrawPortalLeft( bl_dvs.portals.left[i].x, bl_dvs.portals.left[i].y );
          }
          for (i=0;i<bl_dvs.portals.right.length;i++) { 
            MapCanvas.DrawPortalRight( bl_dvs.portals.right[i].x, bl_dvs.portals.right[i].y );
          }
        }

        if ( br_dvs ) {
          for (y=br_dvs.min_y;y<=br_dvs.max_y;y++) {
            for (x=br_dvs.range[y].min_x;x<=br_dvs.range[y].max_x;x++) {
               MapCanvas.DrawHighlight( x, y, palette[3] );
            }
          }
          for (i=0;i<br_dvs.portals.top.length;i++) { 
            MapCanvas.DrawPortalTop( br_dvs.portals.top[i].x, br_dvs.portals.top[i].y );
          }
          for (i=0;i<br_dvs.portals.bottom.length;i++) { 
            MapCanvas.DrawPortalBottom( br_dvs.portals.bottom[i].x, br_dvs.portals.bottom[i].y );
          }
          for (i=0;i<br_dvs.portals.left.length;i++) { 
            MapCanvas.DrawPortalLeft( br_dvs.portals.left[i].x, br_dvs.portals.left[i].y );
          }
          for (i=0;i<br_dvs.portals.right.length;i++) { 
            MapCanvas.DrawPortalRight( br_dvs.portals.right[i].x, br_dvs.portals.right[i].y );
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
      }

      MapCanvas.DrawCornersCanvasIntoVisibleContext();

      webkitRequestAnimationFrame( MapCanvasUpdate );
    }
  });
});

