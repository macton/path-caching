function GridMapCanvas( grid_map, grid_size, parent, options ) {
  var self = this;

  var defaults = { 
    DrawPortalResultRays:     false, 
    DrawPortalResultPortals:  false, 
    DrawPortalResultSegments: false, 
    DrawPortalResultSolid:    true,
    DrawPortalResultCorners:  true 
  };

  self.Settings            = $.extend( {}, defaults, options );
  self.Map                 = grid_map;
  self.GridSize            = grid_size;
  self.BackgroundFillStyle = 'rgb(128,128,255)';
  self.RegionFillStyle     = 'rgb(200,200,200)';
  self.CanvasWidth         = grid_map.Width  * grid_size;
  self.CanvasHeight        = grid_map.Height * grid_size;

  // canvas size is determined by width and height attributes: 
  // http://stackoverflow.com/questions/2588181/canvas-is-stretch-when-using-css-but-normal-with-old-width-and-height-proper 
  self.VisibleCanvas  = $('<canvas width="' + self.CanvasWidth + 'px" height="' + self.CanvasHeight + 'px"></canvas>')[0];
  self.VisibleContext = self.VisibleCanvas.getContext('2d');

  self.FillCanvas     = $('<canvas width="' + self.CanvasWidth + 'px" height="' + self.CanvasHeight + 'px"></canvas>')[0];
  self.FillContext    = self.FillCanvas.getContext('2d');
  self.WallsCanvas    = $('<canvas width="' + self.CanvasWidth + 'px" height="' + self.CanvasHeight + 'px"></canvas>')[0];
  self.WallsContext   = self.WallsCanvas.getContext('2d');
  self.CornersCanvas  = $('<canvas width="' + self.CanvasWidth + 'px" height="' + self.CanvasHeight + 'px"></canvas>')[0];
  self.CornersContext = self.CornersCanvas.getContext('2d');

  self.DrawWallsAll();
  self.DrawFillAll();
  self.DrawCornersAll();

  parent.append( self.VisibleCanvas );
  webkitRequestAnimationFrame( function() { self.UpdateFrame(); } );

  self.VisibleCanvas.addEventListener('mousemove', function(evt) {
    function GetMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }
    var mousePos   = GetMousePos(self.VisibleCanvas, evt);
    var test_x     = ( mousePos.x / self.GridSize );
    var test_y     = ( mousePos.y / self.GridSize );
    var region_x   = ( mousePos.x / self.GridSize ) | 0;
    var region_y   = ( mousePos.y / self.GridSize ) | 0;
    if ( self.Map.IsInterior( region_x, region_y ) ) {
      self.Highlight = { x:region_x, y:region_y };
      self.TestPos   = { x:test_x, y:test_y };
    }
  }, false);
}

GridMapCanvas.prototype.UpdateFrame = function() {
  var self = this;
  var dvs;
  var x;
  var y;
  var x0;
  var y0;
  var x1;
  var y1;
  var x2;
  var y2;
  var portal_results;
  var is_left_outer_wall;
  var is_top_outer_wall;
  var is_right_outer_wall;
  var is_bottom_outer_wall;
  var is_outer_wall;

  self.VisibleContext.drawImage( self.FillCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );

  if ( self.Highlight ) {
    dvs = self.Map.GetDVS( self.Highlight.x, self.Highlight.y );
    for (y=dvs.min_y;y<=dvs.max_y;y++) {
      for (x=dvs.range[y].min_x;x<=dvs.range[y].max_x;x++) {
         self.DrawHighlight( x, y );
      }
    }

    portal_results = self.Map.GetVisibleThroughPortals( self.TestPos.x, self.TestPos.y, self.Highlight.x, self.Highlight.y );

    if ( self.Settings.DrawPortalResultSolid ) {
      for (i=0;i<portal_results.walls.length;i++) {
        x0 = portal_results.walls[i].v0.x;
        y0 = portal_results.walls[i].v0.y;
        x1 = portal_results.walls[i].v1.x;
        y1 = portal_results.walls[i].v1.y;
        x2 = self.TestPos.x;
        y2 = self.TestPos.y;
  
        self.VisibleContext.strokeStyle = 'rgb(255,255,255)';
        self.VisibleContext.fillStyle   = 'rgb(255,255,255)';
        self.VisibleContext.lineWidth   = 1;
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.lineTo( (x2*self.GridSize), (y2*self.GridSize) );
        self.VisibleContext.fill();
        self.VisibleContext.stroke();
      }
    }

    self.VisibleContext.drawImage( self.WallsCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
   
    if ( self.Settings.DrawPortalResultRays ) {
      for (i=0;i<portal_results.walls.length;i++) {
  
        x0 = portal_results.walls[i].v0.x;
        y0 = portal_results.walls[i].v0.y;
        x1 = portal_results.walls[i].v1.x;
        y1 = portal_results.walls[i].v1.y;
  
        is_left_outer_wall   = (x0 == 0) && (x1 == 0);
        is_right_outer_wall  = (x0 == self.Map.Width) && (x1 == self.Map.Width);
        is_top_outer_wall    = (y0 == 0) && (y1 == 0);
        is_bottom_outer_wall = (y0 == self.Map.Height) && (y1 == self.Map.Height);
        is_outer_wall        = is_left_outer_wall || is_right_outer_wall || is_top_outer_wall || is_bottom_outer_wall;
  
        self.VisibleContext.strokeStyle = 'rgb(255,255,255)';
        self.VisibleContext.lineWidth   = is_outer_wall ? 4 : 2;
        self.VisibleContext.lineCap     = 'round'
  
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.stroke();
  
        self.VisibleContext.strokeStyle = 'rgb(255,255,255)';
        self.VisibleContext.lineWidth   = 2;
        self.VisibleContext.lineCap     = 'round'
  
        x0 = self.TestPos.x;
        y0 = self.TestPos.y;
        x1 = portal_results.walls[i].v0.x;
        y1 = portal_results.walls[i].v0.y;
  
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.stroke();
  
        x0 = self.TestPos.x;
        y0 = self.TestPos.y;
        x1 = portal_results.walls[i].v1.x;
        y1 = portal_results.walls[i].v1.y;
  
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.stroke();
      }
    }


    if ( self.Settings.DrawPortalResultSegments ) {
      for (i=0;i<portal_results.segments.length;i++) {
        self.VisibleContext.strokeStyle = 'rgb(255,0,0)';
        self.VisibleContext.lineWidth   = 2;
        self.VisibleContext.lineCap     = 'round'
  
        x0 = portal_results.segments[i].v0.x;
        y0 = portal_results.segments[i].v0.y;
        x1 = portal_results.segments[i].v1.x;
        y1 = portal_results.segments[i].v1.y;
  
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.stroke();
      }
    }

    if ( self.Settings.DrawPortalResultPortals ) {
      for (i=0;i<portal_results.portals.length;i++) {
        self.VisibleContext.strokeStyle = 'rgb(0,255,0)';
        self.VisibleContext.lineWidth   = 4;
        self.VisibleContext.lineCap     = 'butt'
  
        x0 = portal_results.portals[i].v0.x;
        y0 = portal_results.portals[i].v0.y;
        x1 = portal_results.portals[i].v1.x;
        y1 = portal_results.portals[i].v1.y;
  
        self.VisibleContext.beginPath();
        self.VisibleContext.moveTo( (x0*self.GridSize), (y0*self.GridSize) );
        self.VisibleContext.lineTo( (x1*self.GridSize), (y1*self.GridSize) );
        self.VisibleContext.stroke();
      }
    }

    if ( self.Settings.DrawPortalResultPortals ) {
      for (i=0;i<dvs.portals.top.length;i++) { 
        self.DrawPortalTop( dvs.portals.top[i].x, dvs.portals.top[i].y );
      }
      for (i=0;i<dvs.portals.bottom.length;i++) { 
        self.DrawPortalBottom( dvs.portals.bottom[i].x, dvs.portals.bottom[i].y );
      }
      for (i=0;i<dvs.portals.left.length;i++) { 
        self.DrawPortalLeft( dvs.portals.left[i].x, dvs.portals.left[i].y );
      }
      for (i=0;i<dvs.portals.right.length;i++) { 
        self.DrawPortalRight( dvs.portals.right[i].x, dvs.portals.right[i].y );
      }
    }

    if ( self.Settings.DrawPortalResultCorners ) {
      // self.VisibleContext.drawImage( self.CornersCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
      self.VisibleContext.fillStyle = 'rgb(255,0,255)';
      for (i=0;i<portal_results.corners.length;i++) {
        x = portal_results.corners[i].x;
        y = portal_results.corners[i].y;
        self.VisibleContext.beginPath();
        self.VisibleContext.arc(x*self.GridSize, y*self.GridSize, 4, 0, 2 * Math.PI, true);
        self.VisibleContext.fill();
      }
    }
  } else {
    self.VisibleContext.drawImage( self.WallsCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
  }

  if ( !self.Settings.DrawPortalResultCorners ) {
    self.VisibleContext.drawImage( self.CornersCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
  }

  webkitRequestAnimationFrame( function() { self.UpdateFrame(); } );
}

GridMapCanvas.prototype.ClearBackground = function() {
  var self = this;
  self.FillContext.fillStyle = self.BackgroundFillStyle;
  self.FillContext.fillRect( 0, 0, self.CanvasWidth, self.CanvasHeight );
}

GridMapCanvas.prototype.DrawFillAll = function() {
  var self = this;
  var x;
  var y;

  self.ClearBackground();

  self.FillContext.fillStyle = self.RegionFillStyle;
  for (x=0;x<self.Map.Width;x++) {
    for (y=0;y<self.Map.Height;y++) {
      if ( self.Map.IsInterior( x, y ) ) {
        self.FillContext.fillRect( x*self.GridSize, y*self.GridSize, self.GridSize, self.GridSize );
      }
    }
  } 
}

GridMapCanvas.prototype.DrawWallsAll = function() {
  var self = this;

  var x;
  var y;

  self.WallsContext.strokeStyle = 'rgb(0,0,255)';
  self.WallsContext.lineWidth   = 2;
  self.WallsContext.lineCap     = 'round'

  for (x=0;x<self.Map.Width;x++) {
    for (y=0;y<self.Map.Height;y++) {

      if ( self.Map.HasWallLeft( x, y ) ) {
        self.WallsContext.beginPath();
        self.WallsContext.moveTo( (x*self.GridSize), (y*self.GridSize) );
        self.WallsContext.lineTo( (x*self.GridSize), (y*self.GridSize)+self.GridSize );
        self.WallsContext.stroke();
      }

      if ( self.Map.HasWallTop( x, y ) ) {
        self.WallsContext.beginPath();
        self.WallsContext.moveTo( (x*self.GridSize),(y*self.GridSize) );
        self.WallsContext.lineTo( (x*self.GridSize)+self.GridSize, (y*self.GridSize) );
        self.WallsContext.stroke();
      }
    }
  } 

  // exterior map edge

  self.WallsContext.lineWidth = 4;
  self.WallsContext.beginPath();
  self.WallsContext.moveTo( 0, 0 );
  self.WallsContext.lineTo( (self.Map.Width*self.GridSize), 0 );
  self.WallsContext.stroke();
  self.WallsContext.lineTo( (self.Map.Width*self.GridSize), (self.Map.Height*self.GridSize) );
  self.WallsContext.stroke();
  self.WallsContext.lineTo( 0, (self.Map.Height*self.GridSize) );
  self.WallsContext.stroke();
  self.WallsContext.lineTo( 0, 0 );
  self.WallsContext.stroke();
}

GridMapCanvas.prototype.DrawCornersAll = function() {
  var self = this;
  var x;
  var y;

  self.CornersContext.fillStyle = 'rgb(200,0,0)';

  for (x=0;x<self.Map.Width;x++) {
    for (y=0;y<self.Map.Height;y++) {
      if ( self.Map.HasUpperLeftCorner(x,y) ) {
        self.CornersContext.beginPath();
        self.CornersContext.arc(x*self.GridSize, y*self.GridSize, 4, 0, 2 * Math.PI, true);
        self.CornersContext.fill();
      }
    }
  }
}

GridMapCanvas.prototype.DrawHighlight = function( x, y ) {
  var self = this;
  if ( self.Map.IsInterior(x,y) ) {
    self.VisibleContext.fillStyle = 'rgb(255,255,255)';
    self.VisibleContext.fillRect( x*self.GridSize, y*self.GridSize, self.GridSize, self.GridSize );
  }
}

GridMapCanvas.prototype.DrawPortalTop = function( x, y ) {
  var self = this;

  self.VisibleContext.strokeStyle = 'rgb(0,255,0)';
  self.VisibleContext.lineWidth   = 4;
  self.VisibleContext.lineCap     = 'butt'

  self.VisibleContext.beginPath();
  self.VisibleContext.moveTo( x*self.GridSize,(y*self.GridSize) );
  self.VisibleContext.lineTo( (x*self.GridSize)+self.GridSize, (y*self.GridSize) );
  self.VisibleContext.stroke();
}

GridMapCanvas.prototype.DrawPortalBottom = function( x, y ) {
  var self = this;

  self.VisibleContext.strokeStyle = 'rgb(0,255,0)';
  self.VisibleContext.lineWidth   = 4;
  self.VisibleContext.lineCap     = 'butt'

  self.VisibleContext.beginPath();
  self.VisibleContext.moveTo( x*self.GridSize,(y+1)*self.GridSize );
  self.VisibleContext.lineTo( (x*self.GridSize)+self.GridSize, (y+1)*self.GridSize );
  self.VisibleContext.stroke();
}

GridMapCanvas.prototype.DrawPortalLeft = function( x, y ) {
  var self = this;

  self.VisibleContext.strokeStyle = 'rgb(0,255,0)';
  self.VisibleContext.lineWidth   = 4;
  self.VisibleContext.lineCap     = 'butt'

  self.VisibleContext.beginPath();
  self.VisibleContext.moveTo( (x*self.GridSize), (y*self.GridSize) );
  self.VisibleContext.lineTo( (x*self.GridSize), (y*self.GridSize)+self.GridSize );
  self.VisibleContext.stroke();
}

GridMapCanvas.prototype.DrawPortalRight = function( x, y ) {
  var self = this;

  self.VisibleContext.strokeStyle = 'rgb(0,255,0)';
  self.VisibleContext.lineWidth   = 4;
  self.VisibleContext.lineCap     = 'butt'

  self.VisibleContext.beginPath();
  self.VisibleContext.moveTo( ((x+1)*self.GridSize), (y*self.GridSize) );
  self.VisibleContext.lineTo( ((x+1)*self.GridSize), (y*self.GridSize)+self.GridSize );
  self.VisibleContext.stroke();
}
