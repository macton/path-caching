$( function() {

  var g_MapWidth  = 50;
  var g_MapHeight = 50;
  var g_GridSize  = 25;
  var g_Map;
  var g_MapCanvas;
  var g_MapContext;
  var g_MapCorners;
  var g_MapInterior;
  var g_MapVerticalWalls;
  var g_MapHorizontalWalls;
  var g_MapRegions;
  var g_DVS;
  var g_NextRegion = { x:0, y:0 };
  var g_NextRegionDelay = 0;

  function LoadMap( map ) {
    g_Map = map;  

    CreateMap();
    InitMapInterior();
    InitCorners();
    InitMapWalls();
    DrawFillAll();
    DrawWallsAll();
    DrawCornersAll();
    HandleMapHighlight();

   
    $('body').append( '{');
    $('body').append( '  "Corners": "' + g_MapCorners.toHexString() + '",' );
    $('body').append( '  "Interior": "' + g_MapInterior.toHexString() + '",' );
    $('body').append( '  "HorizontalWalls": "' + g_MapHorizontalWalls.toHexString() + '",' );
    $('body').append( '  "VerticalWalls": "' + g_MapVerticalWalls.toHexString() + '"' );
    $('body').append( '}');

    g_MapRegions = [];
    webkitRequestAnimationFrame( UpdateNextRegion );

    // $('body').append( '<div>corner_count = ' + g_MapCorners.length + '</div>' );
  }

  function UpdateNextRegion() {
    if ( g_NextRegionDelay ) {
      g_NextRegionDelay--;
      webkitRequestAnimationFrame( UpdateNextRegion );
      return;
    }

    var x        = g_NextRegion.x;
    var y        = g_NextRegion.y;
    var dvs      = FindVisibleFrom(x,y);
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapRegions[grid_ndx] = $.extend(true, {}, dvs);

    while (1) {
      x++;
      if ( x == g_MapWidth ) {
        x = 0;
        y++;
        if ( y == g_MapHeight ) {
          // $('body').append( JSON.stringify(g_MapRegions) );
          return;
        }
      }
      grid_ndx = ( x * g_MapHeight ) + y;
      if ( g_MapInterior.get( grid_ndx ) ) {
        g_NextRegion.x = x;
        g_NextRegion.y = y;
        g_NextRegionDelay = 0;
        webkitRequestAnimationFrame( UpdateNextRegion );
        return;
      }
   }
  }

  function IsSectionEmpty( section ) {
    return (( section[0] == '0' ) && ( section[1] == '0' ) && ( section[2] == '0' ) && ( section[3] == '0' ));
  }

  function IsCorner( x, y ) {

    //       0
    //       |
    //     0 | 1
    //  3 -- x -- 1
    //     3 | 2
    //       |
    //       2

    var section_0 = g_Map[x-1][y-1];
    var section_1 = g_Map[x][y-1];
    var section_2 = g_Map[x][y];
    var section_3 = g_Map[x-1][y];

    if ( IsSectionEmpty( section_0 ) && IsSectionEmpty( section_1 ) && IsSectionEmpty( section_2 ) && IsSectionEmpty( section_3 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_0 ) && IsSectionEmpty( section_2 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_1 ) && IsSectionEmpty( section_3 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_0 ) && IsSectionEmpty( section_1 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_2 ) && IsSectionEmpty( section_3 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_0 ) && IsSectionEmpty( section_3 ) ) {
      return false;
    }

    if ( IsSectionEmpty( section_1 ) && IsSectionEmpty( section_2 ) ) {
      return false;
    }

    // 0123
    // trbl
    var edges = 0;

    edges |= (1&(section_0[1] == '0')) << 0;
    edges |= (1&(section_1[3] == '0')) << 0;
    edges |= (1&(section_1[2] == '0')) << 1;
    edges |= (1&(section_2[0] == '0')) << 1;
    edges |= (1&(section_2[3] == '0')) << 2;
    edges |= (1&(section_3[1] == '0')) << 2;
    edges |= (1&(section_3[0] == '0')) << 3;
    edges |= (1&(section_0[2] == '0')) << 3;

    var edge_test = 
      (1 << 1) |
      (1 << 2) |
      (1 << 3) |
      (1 << 4) |
      (1 << 6) |
      (1 << 8) |
      (1 << 9) |
      (1 << 12);

    return edge_test & ( 1 << edges );
  }

  function CreateMap() {
    var canvas_width  = g_MapWidth  * g_GridSize;
    var canvas_height = g_MapHeight * g_GridSize;

    // canvas size is determined by width and height attributes: 
    // http://stackoverflow.com/questions/2588181/canvas-is-stretch-when-using-css-but-normal-with-old-width-and-height-proper 
    // var g_MapCanvas    = $('<canvas />', { width: canvas_width, height: canvas_height });

    g_MapCanvas  = $('<canvas width="' + canvas_width + 'px" height="' + canvas_height + 'px"></canvas>')[0];
    g_MapContext = g_MapCanvas.getContext('2d');

    $('body').append( g_MapCanvas );
  }

  function InitCorners() {
    g_MapCorners = new BitArray( g_MapWidth * g_MapHeight );

    var x;
    var y;
    var grid_ndx;

    for (x=1;x<g_MapWidth;x++) {
      for (y=1;y<g_MapHeight;y++) {
        if ( IsCorner( x, y ) ) {
          grid_ndx = ( x * g_MapHeight ) + y;
          g_MapCorners.set( grid_ndx );
        }
      }
    }
  }

  function InitMapInterior() {
    var x;
    var y;
    var section;
    var grid_ndx;

    g_MapInterior = new BitArray( g_MapWidth * g_MapHeight );

    for (x=0,grid_ndx=0;x<g_MapWidth;x++) {
      for (y=0;y<g_MapHeight;y++,grid_ndx++) {
        section = g_Map[x][y];

        if (( section[0] == '0' ) && ( section[1] == '0' ) && ( section[2] == '0' ) && ( section[3] == '0' )) {
          continue;
        }

        g_MapInterior.set( grid_ndx );
      }
    }
  }

  function InitMapWalls() {
    var x;
    var y;
    var i;
    var section;
    var grid_ndx;

    g_MapVerticalWalls   = new BitArray( g_MapWidth * g_MapHeight );
    g_MapHorizontalWalls = new BitArray( g_MapWidth * g_MapHeight );

    // trdl
    for (x=0,grid_ndx=0;x<g_MapWidth;x++) {
      for (y=0;y<g_MapHeight;y++,grid_ndx++) {
        section  = g_Map[x][y];

        if ( g_MapInterior.get( grid_ndx ) == 0 ) {
          continue;
        }

        // right
        if ( section[1] == '0') {
          if ( x < (g_MapWidth-1) ) {
            g_MapVerticalWalls.set( grid_ndx+g_MapHeight );
          }
        } 

        // left
        if ( section[3] == '0' ) {
          if ( x > 0 ) {
            g_MapVerticalWalls.set( grid_ndx );
          }
        } 

        // top
        if ( section[0] == '0') {
          if ( y > 0 ) {
            g_MapHorizontalWalls.set( grid_ndx );
          } 
        } 

        // bottom
        if ( section[2] == '0' ) {
          if ( y < (g_MapHeight-1) ) {
            g_MapHorizontalWalls.set( grid_ndx+1 );
          }
        } 
      }
    } 
  }

  function DrawFillAll() {
    var x;
    var y;
    var i;
    var grid_ndx;

    // background fill
    g_MapContext.fillStyle = 'rgb(128,128,255)';
    g_MapContext.fillRect( 0, 0, g_MapWidth*g_GridSize, g_MapHeight*g_GridSize );

    // trdl
    g_MapContext.fillStyle = 'rgb(200,200,200)';
    for (x=0,grid_ndx=0;x<g_MapWidth;x++) {
      for (y=0;y<g_MapHeight;y++,grid_ndx++) {
        if ( g_MapInterior.get( grid_ndx ) ) {
          g_MapContext.fillRect( x*g_GridSize, y*g_GridSize, g_GridSize, g_GridSize );
        }
      }
    } 
  }

  function DrawFill( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;
    if ( g_MapInterior.get( grid_ndx ) ) {
      g_MapContext.fillStyle = 'rgb(200,200,200)';
      g_MapContext.fillRect( x*g_GridSize, y*g_GridSize, g_GridSize, g_GridSize );
    }
  }

  function DrawHighlight( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;
    if ( g_MapInterior.get( grid_ndx ) ) {
      g_MapContext.fillStyle = 'rgb(255,255,255)';
      g_MapContext.fillRect( x*g_GridSize, y*g_GridSize, g_GridSize, g_GridSize );
    }
  }

  function DrawLowlight( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;
    if ( g_MapInterior.get( grid_ndx ) ) {
      g_MapContext.fillStyle = 'rgb(255,255,0)';
      g_MapContext.fillRect( x*g_GridSize, y*g_GridSize, g_GridSize, g_GridSize );
    }
  }

  function DrawWallsAll() {
    var x;
    var y;
    var i;
    var grid_ndx;

    g_MapContext.strokeStyle = 'rgb(0,0,255)';
    g_MapContext.lineWidth   = 2;
    g_MapContext.lineCap     = 'round'

    for (x=0,grid_ndx=0;x<g_MapWidth;x++) {
      for (y=0;y<g_MapHeight;y++,grid_ndx++) {

        if ( g_MapVerticalWalls.get( grid_ndx ) ) {
          g_MapContext.beginPath();
          g_MapContext.moveTo( (x*g_GridSize), (y*g_GridSize) );
          g_MapContext.lineTo( (x*g_GridSize), (y*g_GridSize)+g_GridSize );
          g_MapContext.stroke();
        }

        if ( g_MapHorizontalWalls.get( grid_ndx ) ) {
          g_MapContext.beginPath();
          g_MapContext.moveTo( (x*g_GridSize),(y*g_GridSize) );
          g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y*g_GridSize) );
          g_MapContext.stroke();
        }
      }
    } 

    // exterior map edge

    g_MapContext.lineWidth = 4;
    g_MapContext.beginPath();
    g_MapContext.moveTo( 0, 0 );
    g_MapContext.lineTo( (g_MapWidth*g_GridSize), 0 );
    g_MapContext.stroke();
    g_MapContext.lineTo( (g_MapWidth*g_GridSize), (g_MapHeight*g_GridSize) );
    g_MapContext.stroke();
    g_MapContext.lineTo( 0, (g_MapHeight*g_GridSize) );
    g_MapContext.stroke();
    g_MapContext.lineTo( 0, 0 );
    g_MapContext.stroke();
  }

  function DrawPortalTop( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapContext.strokeStyle = 'rgb(0,255,0)';
    g_MapContext.lineWidth   = 4;
    g_MapContext.lineCap     = 'butt'

    g_MapContext.beginPath();
    g_MapContext.moveTo( x*g_GridSize,(y*g_GridSize) );
    g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y*g_GridSize) );
    g_MapContext.stroke();
  }

  function DrawPortalBottom( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapContext.strokeStyle = 'rgb(0,255,0)';
    g_MapContext.lineWidth   = 4;
    g_MapContext.lineCap     = 'butt'

    g_MapContext.beginPath();
    g_MapContext.moveTo( x*g_GridSize,(y+1)*g_GridSize );
    g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y+1)*g_GridSize );
    g_MapContext.stroke();
  }

  function DrawPortalLeft( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapContext.strokeStyle = 'rgb(0,255,0)';
    g_MapContext.lineWidth   = 4;
    g_MapContext.lineCap     = 'butt'

    g_MapContext.beginPath();
    g_MapContext.moveTo( (x*g_GridSize), (y*g_GridSize) );
    g_MapContext.lineTo( (x*g_GridSize), (y*g_GridSize)+g_GridSize );
    g_MapContext.stroke();
  }

  function DrawPortalRight( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapContext.strokeStyle = 'rgb(0,255,0)';
    g_MapContext.lineWidth   = 4;
    g_MapContext.lineCap     = 'butt'

    g_MapContext.beginPath();
    g_MapContext.moveTo( ((x+1)*g_GridSize), (y*g_GridSize) );
    g_MapContext.lineTo( ((x+1)*g_GridSize), (y*g_GridSize)+g_GridSize );
    g_MapContext.stroke();
  }

  function DrawWalls( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;

    g_MapContext.strokeStyle = 'rgb(0,0,255)';
    g_MapContext.lineWidth   = 2;
    g_MapContext.lineCap     = 'round'

    // left
    if ( g_MapVerticalWalls.get( grid_ndx ) ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( (x*g_GridSize), (y*g_GridSize) );
      g_MapContext.lineTo( (x*g_GridSize), (y*g_GridSize)+g_GridSize );
      g_MapContext.stroke();
    }

    // right
    if ( x < (g_MapWidth-1) ) {
      if ( g_MapVerticalWalls.get( grid_ndx+g_MapHeight ) ) {
        g_MapContext.beginPath();
        g_MapContext.moveTo( ((x+1)*g_GridSize), (y*g_GridSize) );
        g_MapContext.lineTo( ((x+1)*g_GridSize), (y*g_GridSize)+g_GridSize );
        g_MapContext.stroke();
      }
    }

    // top
    if ( g_MapHorizontalWalls.get( grid_ndx ) ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( x*g_GridSize,(y*g_GridSize) );
      g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y*g_GridSize) );
      g_MapContext.stroke();
    }

    // bottom 
    if ( y < (g_MapHeight-1) ) {
      if ( g_MapHorizontalWalls.get( grid_ndx+1 ) ) {
        g_MapContext.beginPath();
        g_MapContext.moveTo( (x*g_GridSize),((y+1)*g_GridSize) );
        g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y+1)*g_GridSize );
        g_MapContext.stroke();
      }
    }

    // outer walls 
    g_MapContext.lineWidth = 4;

    if ( x == (g_MapWidth-1) ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( ((x+1)*g_GridSize), (y*g_GridSize) );
      g_MapContext.lineTo( ((x+1)*g_GridSize), (y*g_GridSize)+g_GridSize );
      g_MapContext.stroke();
    }
    else if ( x == 0 ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( (x*g_GridSize), (y*g_GridSize) );
      g_MapContext.lineTo( (x*g_GridSize), (y*g_GridSize)+g_GridSize );
      g_MapContext.stroke();
    }

    if ( y == (g_MapHeight-1) ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( (x*g_GridSize),((y+1)*g_GridSize) );
      g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, (y+1)*g_GridSize );
      g_MapContext.stroke();
    }
    else if ( y == 0 ) {
      g_MapContext.beginPath();
      g_MapContext.moveTo( (x*g_GridSize),y*g_GridSize );
      g_MapContext.lineTo( (x*g_GridSize)+g_GridSize, y*g_GridSize );
      g_MapContext.stroke();
    }
  }
 
  function DrawCornersAll() {
    var x;
    var y;
    var i;
    var grid_ndx;

    g_MapContext.fillStyle   = 'rgb(200,0,0)';

    for (x=0,grid_ndx=0;x<g_MapWidth;x++) {
      for (y=0;y<g_MapHeight;y++,grid_ndx++) {
        if ( g_MapCorners.get(grid_ndx) ) {
          g_MapContext.beginPath();
          g_MapContext.arc(x*g_GridSize, y*g_GridSize, 4, 0, 2 * Math.PI, true);
          g_MapContext.fill();
        }
      }
    }
  }

  function HighlightCorner(x,y) {
    var grid_ndx;

    g_MapContext.fillStyle   = 'rgb(255,255,255)';

    grid_ndx = ( x * g_MapHeight ) + y;
    g_MapContext.beginPath();
    g_MapContext.arc(x*g_GridSize, y*g_GridSize, 4, 0, 2 * Math.PI, true);
    g_MapContext.fill();
  }

  function DrawCorners(x,y) {
    var grid_ndx;

    g_MapContext.fillStyle   = 'rgb(200,0,0)';

    grid_ndx = ( x * g_MapHeight ) + y;
    if ( g_MapCorners.get(grid_ndx) ) {
      g_MapContext.beginPath();
      g_MapContext.arc(x*g_GridSize, y*g_GridSize, 4, 0, 2 * Math.PI, true);
      g_MapContext.fill();
    }

    if ( x < (g_MapWidth-1) ) {
      grid_ndx = ( (x+1) * g_MapHeight ) + y;
      if ( g_MapCorners.get(grid_ndx) ) {
        g_MapContext.beginPath();
        g_MapContext.arc((x+1)*g_GridSize, y*g_GridSize, 4, 0, 2 * Math.PI, true);
        g_MapContext.fill();
      }
    }

    if (( x < (g_MapWidth-1) ) && ( y < (g_MapHeight-1) )) {
      grid_ndx = ( (x+1) * g_MapHeight ) + (y+1);
      if ( g_MapCorners.get(grid_ndx) ) {
        g_MapContext.beginPath();
        g_MapContext.arc((x+1)*g_GridSize, (y+1)*g_GridSize, 4, 0, 2 * Math.PI, true);
        g_MapContext.fill();
      }
    }

    if ( y < (g_MapHeight-1) ) {
      grid_ndx = ( x * g_MapHeight ) + (y+1);
      if ( g_MapCorners.get(grid_ndx) ) {
        g_MapContext.beginPath();
        g_MapContext.arc(x*g_GridSize, (y+1)*g_GridSize, 4, 0, 2 * Math.PI, true);
        g_MapContext.fill();
      }
    }
  }
  
  function HasTopLeftCorner( x, y ) {
    var grid_ndx = ( x * g_MapHeight ) + y;
    return g_MapCorners.get(grid_ndx);
  }

  function HasTopRightCorner( x, y ) {
    if ( x == (g_MapWidth-1) ) {
      return false;
    }
    var grid_ndx = ( (x+1) * g_MapHeight ) + y;
    return g_MapCorners.get(grid_ndx);
  }

  function HasBottomLeftCorner( x, y ) {
    if ( y == (g_MapHeight-1) ) {
      return false;
    }
    var grid_ndx = ( x * g_MapHeight ) + (y+1);
    return g_MapCorners.get(grid_ndx);
  }

  function HasBottomRightCorner( x, y ) {
    if ( y == (g_MapHeight-1) ) {
      return false;
    }
    if ( x == (g_MapWidth-1) ) {
      return false;
    }
    var grid_ndx = ( (x+1) * g_MapHeight ) + (y+1);
    return g_MapCorners.get(grid_ndx);
  }

  function FindVisibleFromLeft( x, y, gather, dvs, min_x ) {
    var grid_ndx;
    var left_top_grid_ndx;
    var left_bottom_grid_ndx;

    min_x = (!min_x) ? 0 : min_x;

    while ( x > min_x ) {
      grid_ndx             = ( x * g_MapHeight ) + y;
      left_top_grid_ndx    = grid_ndx;
      left_bottom_grid_ndx = ( x * g_MapHeight ) + ( y+1 );

      if ( HasTopLeftCorner( x, y ) ) {
        if ( (!gather.min_left_top) || (x > gather.min_left_top.x)) {
          gather.min_left_top = { x:x, y:y };
        }
      }
      if ( HasBottomLeftCorner( x, y ) ) {
        if ( (!gather.min_left_bottom) || (x > gather.min_left_bottom.x)) {
          gather.min_left_bottom = { x:x, y:(y+1) };
        }
      }

      if ( g_MapVerticalWalls.get( grid_ndx ) ) {
        gather.max_left = { x:x, y:y };
        return;
      }
      x--;
      dvs.range[ y ].min_x = ( x < dvs.range[ y ].min_x ) ? x : dvs.range[ y ].min_x;
      dvs.range[ y ].max_x = ( x > dvs.range[ y ].max_x ) ? x : dvs.range[ y ].max_x;
    }
    gather.max_left = { x:x, y:y };
  }

  function FindVisibleFromRight( x, y, gather, dvs, max_x ) {
    var grid_ndx;

    max_x = (!max_x) ? (g_MapWidth-1) : max_x;

    while ( x < (max_x-1) ) {
      x++;
      grid_ndx = ( x * g_MapHeight ) + y;

      if ( HasTopLeftCorner( x, y ) ) {
        if ( (!gather.min_right_top) || (x < gather.min_right_top.x)) {
          gather.min_right_top = { x:x, y:y };
        }
      }
      if ( HasBottomLeftCorner( x, y ) ) {
        if ( (!gather.min_right_bottom) || (x < gather.min_right_bottom.x)) {
          gather.min_right_bottom = { x:x, y:(y+1) };
        }
      }

      if ( g_MapVerticalWalls.get( grid_ndx ) ) {
        gather.max_right = { x:x, y:y };
        return;
      }
      dvs.range[ y ].min_x = ( x < dvs.range[ y ].min_x ) ? x : dvs.range[ y ].min_x;
      dvs.range[ y ].max_x = ( x > dvs.range[ y ].max_x ) ? x : dvs.range[ y ].max_x;
    }
    gather.max_right = { x:(x+1), y:y };
  }

  function FindVisibleFromTop( x, y, gather, dvs, min_y ) {
    var grid_ndx;

    min_y = (!min_y) ? 0 : min_y;

    while ( y > min_y ) {
      grid_ndx = ( x * g_MapHeight ) + y;

      if ( HasTopLeftCorner( x, y ) ) {
        if ( (!gather.min_top_left) || (y > gather.min_top_left.y)) {
          gather.min_top_left = { x:x, y:y };
        }
      }
      if ( HasTopRightCorner( x, y ) ) {
        if ( (!gather.min_top_right) || (y > gather.min_top_right.y)) {
          gather.min_top_right = { x:(x+1), y:y };
        }
      }

      if ( g_MapHorizontalWalls.get( grid_ndx ) ) {
        gather.max_top = { x:x, y:y };
        return;
      }
      y--;
      if ( y < dvs.min_y ) {
        dvs.min_y = y;
        dvs.range[ y ] = { min_x: x, max_x: x };
      }
      else {
        dvs.range[ y ].min_x = ( x < dvs.range[ y ].min_x ) ? x : dvs.range[ y ].min_x;
        dvs.range[ y ].max_x = ( x > dvs.range[ y ].max_x ) ? x : dvs.range[ y ].max_x;
      }
    }
    gather.max_top = { x:x, y:y };
  }

  function FindVisibleFromBottom( x, y, gather, dvs, max_y ) {
    var grid_ndx;

    max_y = (!max_y) ? (g_MapWidth-1) : max_y;

    while ( y < max_y ) {
      y++;
      grid_ndx = ( x * g_MapHeight ) + y;

      if ( HasTopLeftCorner( x, y ) ) {
        if ( (!gather.min_bottom_left) || (y < gather.min_bottom_left.y)) {
          gather.min_bottom_left = { x:x, y:y };
        }
      }
      if ( HasTopRightCorner( x, y ) ) {
        if ( (!gather.min_bottom_right) || (y < gather.min_bottom_right.y)) {
          gather.min_bottom_right = { x:(x+1), y:y };
        }
      }

      if ( g_MapHorizontalWalls.get( grid_ndx ) ) {
        gather.max_bottom = { x:x, y:y };
        return;
      }
      if ( y > dvs.max_y ) {
        dvs.max_y = y;
        dvs.range[ y ] = { min_x: x, max_x: x };
      }
      else {
        dvs.range[ y ].min_x = ( x < dvs.range[ y ].min_x ) ? x : dvs.range[ y ].min_x;
        dvs.range[ y ].max_x = ( x > dvs.range[ y ].max_x ) ? x : dvs.range[ y ].max_x;
      }
    }
    gather.max_bottom = { x:x, y:y };
  }

  function FindVisibleTopLeftQuadrant( x, y, gather, dvs ) {
    var max_top  = gather.min_top_left ? gather.min_top_left.y : gather.max_top.y;
    var max_left;

    for (i=y-1;i>=max_top;i--) {
      max_left = gather.min_left_top ? gather.min_left_top.x : gather.max_left.x;
      FindVisibleFromLeft( x, i, gather, dvs, max_left );
    }
  }

  function FindVisibleBottomLeftQuadrant( x, y, gather, dvs ) {
    var max_bottom  = gather.min_bottom_left ? gather.min_bottom_left.y : gather.max_bottom.y;
    var max_left;

    for (i=y+1;i<max_bottom;i++) {
      max_left = gather.min_left_bottom ? gather.min_left_bottom.x : gather.max_left.x;
      FindVisibleFromLeft( x, i, gather, dvs, max_left );
    }
  }

  function FindVisibleTopRightQuadrant( x, y, gather, dvs ) {
    var max_top  = gather.min_top_right ? gather.min_top_right.y : gather.max_top.y;
    var max_right;

    for (i=y-1;i>=max_top;i--) {
      max_right = gather.min_right_top ? gather.min_right_top.x : gather.max_right.x;
      FindVisibleFromRight( x, i, gather, dvs, max_right );
    }
  }

  function FindVisibleBottomRightQuadrant( x, y, gather, dvs ) {
    var max_bottom  = gather.min_bottom_right ? gather.min_bottom_right.y : gather.max_bottom.y;
    var max_right;

    for (i=y+1;i<max_bottom;i++) {
      max_right = gather.min_right_bottom ? gather.min_right_bottom.x : gather.max_right.x;
      FindVisibleFromRight( x, i, gather, dvs, max_right );
    }
  }

  function FindPortals( dvs ) {
    var x;
    var y;
    var is_wall;
    var is_inside;
    var grid_ndx;
    var inv_dvs = { };

    y = dvs.min_y;
    x = dvs.range[ y ].min_x;

    inv_dvs.min_x          = x;
    inv_dvs.max_x          = x;
    inv_dvs.range          = { };
    inv_dvs.range[x]       = { min_y: y, max_y: y };

    dvs.portals        = { };
    dvs.portals.top    = [ ];
    dvs.portals.bottom = [ ];
    dvs.portals.left   = [ ];
    dvs.portals.right  = [ ];

    // find top and bottom portals, create inverse dvs
    for (y=dvs.min_y;y<=dvs.max_y;y++) {
      for (x=dvs.range[y].min_x;x<=dvs.range[y].max_x;x++) {
        // inv_dvs
        if ( x < inv_dvs.min_x ) {
          inv_dvs.min_x      = x;
          inv_dvs.range[ x ] = { min_y: y, max_y: y };
        }
        else if ( x > inv_dvs.max_x ) {
          inv_dvs.max_x      = x;
          inv_dvs.range[ x ] = { min_y: y, max_y: y };
        }
        else if ( inv_dvs.range[ x ] ) {
          inv_dvs.range[ x ].min_y = ( y < inv_dvs.range[ x ].min_y ) ? y : inv_dvs.range[ x ].min_y;
          inv_dvs.range[ x ].max_y = ( y > inv_dvs.range[ x ].max_y ) ? y : inv_dvs.range[ x ].max_y;
        }
        else {
          inv_dvs.range[ x ] = { min_y: y, max_y: y };
        }
 
        // find top portals
        if ( y > 0 ) {
          is_inside = (( y > dvs.min_y ) && ( x >= dvs.range[y-1].min_x ) && ( x <= dvs.range[y-1].max_x ));
          is_wall   = g_MapHorizontalWalls.get( ( x * g_MapHeight ) + y );
          if ((!is_inside) && (!is_wall)) {
            dvs.portals.top.push( { x: x, y: y } );
          }
        }
        // find bottom portals
        if ( y < (g_MapHeight-1) ) {
          is_inside = (( y < dvs.max_y ) && ( x >= dvs.range[y+1].min_x ) && ( x <= dvs.range[y+1].max_x ));
          is_wall   = g_MapHorizontalWalls.get( ( x * g_MapHeight ) + (y+1) );
          if ((!is_inside) && (!is_wall)) {
            dvs.portals.bottom.push( { x: x, y: y } );
          }
        }
      }
    }

    // find left and right portals
    for (x=inv_dvs.min_x;x<=inv_dvs.max_x;x++) {
      for (y=inv_dvs.range[x].min_y;y<=inv_dvs.range[x].max_y;y++) {
        // find left portals
        if ( x > 0 ) {
          is_inside = (( x > inv_dvs.min_x ) && ( y >= inv_dvs.range[x-1].min_y ) && ( y <= inv_dvs.range[x-1].max_y ));
          is_wall   = g_MapVerticalWalls.get( ( x * g_MapHeight ) + y );
          if ((!is_inside) && (!is_wall)) {
            dvs.portals.left.push( { x: x, y: y } );
          }
        }
        // find bottom portals
        if ( x < (g_MapWidth-1) ) {
          is_inside = (( x < inv_dvs.max_x ) && ( y >= inv_dvs.range[x+1].min_y ) && ( y <= inv_dvs.range[x+1].max_y ));
          is_wall   = g_MapVerticalWalls.get( ( (x+1) * g_MapHeight ) + y );
          if ((!is_inside) && (!is_wall)) {
            dvs.portals.right.push( { x: x, y: y } );
          }
        }
      }
    }

  }

  function FindVisibleFrom( x, y ) {
    var gather = { };
    var dvs    = { };
    var grid_ndx;

    dvs.min_y          = y;
    dvs.max_y          = y;
    dvs.range          = { };
    dvs.range[y]       = { min_x: x, max_x: x };

    FindVisibleFromLeft( x, y, gather, dvs );
    FindVisibleFromRight( x, y, gather, dvs );
    FindVisibleFromTop( x, y, gather, dvs );
    FindVisibleFromBottom( x, y, gather, dvs );

    var gather_top_left     = Object.create(gather);
    var gather_bottom_left  = Object.create(gather);
    var gather_top_right    = Object.create(gather);
    var gather_bottom_right = Object.create(gather);

    FindVisibleTopLeftQuadrant( x, y, gather_top_left, dvs );
    FindVisibleBottomLeftQuadrant( x, y, gather_bottom_left, dvs );
    FindVisibleTopRightQuadrant( x, y, gather_top_right, dvs );
    FindVisibleBottomRightQuadrant( x, y, gather_bottom_right, dvs );

    FindPortals( dvs );

    return dvs;
  }

  function GetMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function UpdateRegion( x, y ) {

    var grid_ndx = ( x * g_MapHeight ) + y;
    var select_x = x;
    var select_y = y;

    // clear previous highlight
    if ( g_DVS ) {
      for (i=0;i<g_DVS.portals.top.length;i++) { 
        x = g_DVS.portals.top[i].x;
        y = g_DVS.portals.top[i].y-1;
        DrawFill( x, y );
        DrawWalls( x, y );
        DrawCorners( x, y );
      }
      for (i=0;i<g_DVS.portals.bottom.length;i++) { 
        x = g_DVS.portals.bottom[i].x;
        y = g_DVS.portals.bottom[i].y+1;
        DrawFill( x, y );
        DrawWalls( x, y );
        DrawCorners( x, y );
      }
      for (i=0;i<g_DVS.portals.left.length;i++) { 
        x = g_DVS.portals.left[i].x-1;
        y = g_DVS.portals.left[i].y;
        DrawFill( x, y );
        DrawWalls( x, y );
        DrawCorners( x, y );
      }
      for (i=0;i<g_DVS.portals.right.length;i++) { 
        x = g_DVS.portals.right[i].x+1;
        y = g_DVS.portals.right[i].y;
        DrawFill( x, y );
        DrawWalls( x, y );
        DrawCorners( x, y );
      }
      for (y=g_DVS.min_y;y<=g_DVS.max_y;y++) {
        for (x=g_DVS.range[y].min_x;x<=g_DVS.range[y].max_x;x++) {
          DrawFill( x, y );
          DrawWalls( x, y );
          DrawCorners( x, y );
        }
      }
    }

    x = select_x;
    y = select_y;

    if ( g_MapInterior.get( grid_ndx ) ) {
      g_DVS =  g_MapRegions[grid_ndx] ? g_MapRegions[grid_ndx] : FindVisibleFrom(x,y);
      for (y=g_DVS.min_y;y<=g_DVS.max_y;y++) {
        for (x=g_DVS.range[y].min_x;x<=g_DVS.range[y].max_x;x++) {
          DrawHighlight( x, y );
        }
      }
      DrawLowlight( select_x, select_y );

      for (i=0;i<g_DVS.portals.top.length;i++) { 
        x = g_DVS.portals.top[i].x;
        y = g_DVS.portals.top[i].y;
        DrawPortalTop(x,y);
      }
      for (i=0;i<g_DVS.portals.bottom.length;i++) { 
        x = g_DVS.portals.bottom[i].x;
        y = g_DVS.portals.bottom[i].y;
        DrawPortalBottom(x,y);
      }
      for (i=0;i<g_DVS.portals.left.length;i++) { 
        x = g_DVS.portals.left[i].x;
        y = g_DVS.portals.left[i].y;
        DrawPortalLeft(x,y);
      }
      for (i=0;i<g_DVS.portals.right.length;i++) { 
        x = g_DVS.portals.right[i].x;
        y = g_DVS.portals.right[i].y;
        DrawPortalRight(x,y);
      }

      for (y=g_DVS.min_y;y<=g_DVS.max_y;y++) {
        for (x=g_DVS.range[y].min_x;x<=g_DVS.range[y].max_x;x++) {
          DrawWalls( x, y );
          DrawCorners( x, y );
        }
      }
    }
  };

  function HandleMapHighlight() {

    g_MapCanvas.addEventListener('mousemove', function(evt) {
      var mousePos = GetMousePos(g_MapCanvas, evt);
      var x        = ( mousePos.x / g_GridSize ) | 0;
      var y        = ( mousePos.y / g_GridSize ) | 0;
      UpdateRegion(x,y);
    }, false);
  }
   
  $.get( 'map_50x50.json', LoadMap, 'json' );

});
