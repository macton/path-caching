function GridMapCanvas( grid_map, grid_size, parent ) {
  var self = this;

  self.Map                 = grid_map;
  self.GridSize            = grid_size;
  self.BackgroundFillStyle = 'rgb(128,128,255)';
  self.RegionFillStyle     = 'rgb(200,200,200)';
  self.CanvasWidth         = grid_map.Width  * grid_size;
  self.CanvasHeight        = grid_map.Height * grid_size;
  self.MouseMapPos         = { x:-1, y:-1 };

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

  self.VisibleCanvas.addEventListener('mousemove', function(evt) {

    function GetMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    var mouse_pos    = GetMousePos(self.VisibleCanvas, evt);
    var mouse_map_x  = mouse_pos.x / self.GridSize;
    var mouse_map_y  = mouse_pos.y / self.GridSize;

    self.MouseMapPos = { x:mouse_map_x, y:mouse_map_y };

  }, false);
}

GridMapCanvas.prototype.DrawFillCanvasIntoVisibleContext = function() {
  var self = this;
  self.VisibleContext.drawImage( self.FillCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
}

GridMapCanvas.prototype.DrawWallsCanvasIntoVisibleContext = function() {
  var self = this;
  self.VisibleContext.drawImage( self.WallsCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
}

GridMapCanvas.prototype.DrawCornersCanvasIntoVisibleContext = function() {
  var self = this;
  self.VisibleContext.drawImage( self.CornersCanvas, 0, 0, self.CanvasWidth, self.CanvasHeight, 0, 0, self.CanvasWidth, self.CanvasHeight );
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

GridMapCanvas.prototype.DrawHighlight = function( x, y, fill_style ) {
  var self = this;
  if ( self.Map.IsInterior(x,y) ) {
    self.VisibleContext.fillStyle = (!fill_style)?'rgb(255,255,255)':fill_style;
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
