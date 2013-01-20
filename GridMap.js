function GridMap() {
}

GridMap.prototype.kBothLeft    = 0;
GridMap.prototype.kARightBLeft = 1;
GridMap.prototype.kALeftBRight = 2;
GridMap.prototype.kBothRight   = 3;

GridMap.prototype.kTop    = 1;
GridMap.prototype.kLeft   = 2;
GridMap.prototype.kBottom = 4;
GridMap.prototype.kRight  = 8;

GridMap.prototype.Load = function( map_url, on_success ) {
  var self = this;
  $.get( map_url, function( map ) { 
    var bit_size;
    $.extend( self, map ); 
    bit_size              = self.Width * self.Height;
    self.Interior         = new BitArray( bit_size, self.Interior );
    self.VerticalWalls    = new BitArray( bit_size, self.VerticalWalls  );
    self.HorizontalWalls  = new BitArray( bit_size, self.HorizontalWalls  );
    self.Corners          = new BitArray( bit_size, self.Corners  );
    on_success( self ); 
  }, 'json' );
}

GridMap.prototype.IsInterior = function( x, y ) {
  var self     = this;
  var grid_ndx = ( x * self.Height ) + y;
  return self.Interior.get( grid_ndx );
}

GridMap.prototype.IsCorner = function( x, y ) {
  var self     = this;
  var grid_ndx = ( x * self.Height ) + y;
  if ( self.IsValueInclusiveRange(x, 0, self.Width-1) && self.IsValueInclusiveRange(y, 0, self.Height-1) ) {
    return self.Corners.get( grid_ndx );
  }
  return false;
}

GridMap.prototype.IsValueInclusiveRange = function( x, min_x, max_x ) {
  return ( x >= min_x ) && ( x <= max_x );
}

GridMap.prototype.HasUpperLeftCorner = function( x, y ) {
  var self     = this;
  var grid_ndx = ( x * self.Height ) + y;
  return self.Corners.get( grid_ndx );
}

GridMap.prototype.HasWallLeft = function( x, y ) {
  var self     = this;
  var grid_ndx = ( x * self.Height ) + y;
  if ( x == 0 ) {
    return true;
  }
  return self.VerticalWalls.get( grid_ndx );
}

GridMap.prototype.HasWallRight = function( x, y ) {
  var self     = this;
  if ( x == (self.Width-1) ) {
    return true;
  }
  var grid_ndx = ( (x+1) * self.Height ) + y;
  return self.VerticalWalls.get( grid_ndx );
}

GridMap.prototype.HasWallTop = function( x, y ) {
  var self     = this;
  if ( y == 0 ) {
    return true;
  }
  var grid_ndx = ( x * self.Height ) + y;
  return self.HorizontalWalls.get( grid_ndx );
}

GridMap.prototype.HasWallBottom = function( x, y ) {
  var self     = this;
  if ( y == (self.Height-1) ) {
    return true;
  }
  var grid_ndx = ( x * self.Height ) + (y+1);
  return self.HorizontalWalls.get( grid_ndx );
}

GridMap.prototype.GetDVS = function( test_x, test_y, min_x, min_y, max_x, max_y, test_direction ) {
  var self     = this;
  var grid_ndx = ( test_x * self.Height ) + test_y;
  var dvs      = self.RegionDvs[grid_ndx];
  var limit_dvs;
  var x;
  var y;
  var i;

  // no range limit provided
  if ( min_x == undefined ) {
    return dvs;
  }

  if ( !dvs ) {
    return dvs;
  }

  limit_dvs       = {};
  limit_dvs.min_y = ( dvs.min_y < min_y ) ? min_y : dvs.min_y;
  limit_dvs.max_y = ( dvs.max_y > max_y ) ? max_y : dvs.max_y;
  limit_dvs.range = [];
  for (y=limit_dvs.min_y;y<=limit_dvs.max_y;y++) {
    limit_dvs.range[y] = { };
    limit_dvs.range[y].min_x = ( dvs.range[y].min_x < min_x ) ? min_x : dvs.range[y].min_x;
    limit_dvs.range[y].max_x = ( dvs.range[y].max_x > max_x ) ? max_x : dvs.range[y].max_x;
  }

  limit_dvs.portals = { top: [], bottom: [], left: [], right: [] };

  if ( test_direction & self.kTop ) {
    for (i=0;i<dvs.portals.top.length;i++) { 
      x           = dvs.portals.top[i].x;
      y           = dvs.portals.top[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) ) {
        limit_dvs.portals.top.push( { x:x, y:y } ); 
      }
    }
  }

  if ( test_direction & self.kBottom ) {
    for (i=0;i<dvs.portals.bottom.length;i++) { 
      x           = dvs.portals.bottom[i].x;
      y           = dvs.portals.bottom[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) ) {
        limit_dvs.portals.bottom.push( { x:x, y:y } ); 
      }
    }    
  }

  if ( test_direction & self.kLeft ) {
    for (i=0;i<dvs.portals.left.length;i++) { 
      x           = dvs.portals.left[i].x;
      y           = dvs.portals.left[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) ) {
        limit_dvs.portals.left.push( { x:x, y:y } ); 
      }
    }
  }

  if ( test_direction & self.kRight ) {
    for (i=0;i<dvs.portals.right.length;i++) { 
      x           = dvs.portals.right[i].x;
      y           = dvs.portals.right[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) ) {
        limit_dvs.portals.right.push( { x:x, y:y } ); 
      }
    }
  }

  return limit_dvs;
}

GridMap.prototype.TestSegmentPoint = function( segment_v0, segment_v1, pt ) {
  return ((segment_v1.x - segment_v0.x)*(pt.y - segment_v0.y) - (segment_v1.y - segment_v0.y)*(pt.x - segment_v0.x)) > 0;
}

GridMap.prototype.TestSegmentAgainstTop = function( segment, region ) {
  // top = left->right
  var self   = this;
  var side_a = self.TestSegmentPoint( segment.v0, segment.v1, { x:region.x,     y:region.y } )?1:0;
  var side_b = self.TestSegmentPoint( segment.v0, segment.v1, { x:(region.x+1), y:region.y } )?1:0;
  var result = ( side_a ) | ( side_b << 1 );
  return result;
}

GridMap.prototype.TestSegmentAgainstBottom = function( segment, region ) {
  // bottom = left->right
  var self   = this;
  var side_a = self.TestSegmentPoint( segment.v0, segment.v1, { x:region.x,     y:(region.y+1) } )?1:0;
  var side_b = self.TestSegmentPoint( segment.v0, segment.v1, { x:(region.x+1), y:(region.y+1) } )?1:0;
  var result = ( side_a ) | ( side_b << 1 );
  return result;
}

GridMap.prototype.TestSegmentAgainstLeft = function( segment, region ) {
  // left = top->bottom
  var self   = this;
  var side_a = self.TestSegmentPoint( segment.v0, segment.v1, { x:region.x, y:region.y     } )?1:0;
  var side_b = self.TestSegmentPoint( segment.v0, segment.v1, { x:region.x, y:(region.y+1) } )?1:0;
  var result = ( side_a ) | ( side_b << 1 );
  return result;
}

GridMap.prototype.TestSegmentAgainstRight = function( segment, region ) {
  // right = top->bottom
  var self   = this;
  var side_a = self.TestSegmentPoint( segment.v0, segment.v1, { x:(region.x+1), y:region.y     } )?1:0;
  var side_b = self.TestSegmentPoint( segment.v0, segment.v1, { x:(region.x+1), y:(region.y+1) } )?1:0;
  var result = ( side_a ) | ( side_b << 1 );
  return result;
}

GridMap.prototype.AddResultsLocalCorner = function( test_pt, corner_x, corner_y, results ) {
  var self   = this;
  if ( ( test_pt.x > corner_x ) && ( test_pt.y > corner_y ) ) {
    if ( self.HasWallTop( corner_x-1, corner_y ) && self.HasWallLeft( corner_x, corner_y-1 ) ) {
      return;
    }
  } else if ( ( test_pt.x < corner_x ) && ( test_pt.y > corner_y ) ) {
    if ( self.HasWallTop( corner_x, corner_y ) && self.HasWallLeft( corner_x, corner_y-1 ) ) {
      return;
    }
  } else if ( ( test_pt.x < corner_x ) && ( test_pt.y < corner_y ) ) {
    if ( self.HasWallTop( corner_x, corner_y ) && self.HasWallLeft( corner_x, corner_y ) ) {
      return;
    }
  } else if ( ( test_pt.x > corner_x ) && ( test_pt.y < corner_y ) ) {
    if ( self.HasWallTop( corner_x-1, corner_y ) && self.HasWallLeft( corner_x, corner_y ) ) {
      return;
    }
  }
  
  results.corners.push( { x:corner_x, y:corner_y } );
}

GridMap.prototype.GetVisibleSegmentsThroughSinglePortal = function( portal_direction, portal_segment, test_pt, results, min_x, min_y, max_x, max_y ) {
  var self      = this;
  var r_x;
  var r_y;
  var test_directions;

  switch ( portal_direction ) {
    case self.kTop:
      r_x             = portal_segment.v0.x|0;
      r_y             = (portal_segment.v0.y|0)-1;
      test_directions = self.kTop | self.kLeft | self.kRight;
      min_y           = (min_y && (min_y > 0)) ? min_y : 0;
      max_y           = (max_y && (max_y < r_y))  ? max_y : r_y;
      min_x           = (min_x && (min_x > 0)) ? min_x : 0;
      max_x           = (max_x && (max_x < (self.Width-1))) ? max_x : (self.Width-1);
    break;
    case self.kBottom:
      r_x             = portal_segment.v1.x|0;
      r_y             = portal_segment.v1.y|0;
      test_directions = self.kBottom | self.kLeft | self.kRight;
      min_y           = (min_y && (min_y > r_y)) ? min_y : r_y; 
      max_y           = (max_y && (max_y < (self.Height-1)))  ? max_y : (self.Height-1);
      min_x           = (min_x && (min_x > 0)) ? min_x : 0;
      max_x           = (max_x && (max_x < (self.Width-1))) ? max_x : (self.Width-1);
    break;
    case self.kLeft:
      r_x             = (portal_segment.v1.x|0)-1;
      r_y             = portal_segment.v1.y|0;
      test_directions = self.kLeft | self.kTop | self.kBottom;
      min_y           = (min_y && (min_y > 0)) ? min_y : 0; 
      max_y           = (max_y && (max_y < (self.Height-1)))  ? max_y : (self.Height-1);
      min_x           = (min_x && (min_x > 0)) ? min_x : 0;
      max_x           = (max_x && (max_x < r_x)) ? max_x : r_x;
    break;
    case self.kRight:
      r_x             = portal_segment.v0.x|0;
      r_y             = portal_segment.v0.y|0;
      test_directions = self.kRight | self.kTop | self.kBottom;
      min_y           = (min_y && (min_y > 0)) ? min_y : 0; 
      max_y           = (max_y && (max_y < (self.Height-1)))  ? max_y : (self.Height-1);
      min_x           = (min_x && (min_x > r_x)) ? min_x : r_x;
      max_x           = (max_x && (max_x < (self.Width-1))) ? max_x : (self.Width-1);
    break;
  }

  var dvs       = self.GetDVS( r_x, r_y );
  var x;
  var y;
  var i;

  if (!dvs) {
    return;
  }

  var segment_a = { v0: {x: test_pt.x, y: test_pt.y},
                    v1: {x: portal_segment.v0.x, y: portal_segment.v0.y } };
  var segment_b = { v0: {x: test_pt.x, y: test_pt.y},
                    v1: {x: portal_segment.v1.x, y: portal_segment.v1.y } };

  results.segments.push( segment_a );
  results.segments.push( segment_b );

  var test_a;
  var test_b;
  var test_region;
  var result_wall;
  var result_portal;
  var segment_a_dx = segment_a.v1.x - segment_a.v0.x;
  var segment_a_dy = segment_a.v1.y - segment_a.v0.y;
  var segment_b_dx = segment_b.v1.x - segment_b.v0.x;
  var segment_b_dy = segment_b.v1.y - segment_b.v0.y;
  var segment_a_m  = segment_a_dy / segment_a_dx;
  var segment_b_m  = segment_b_dy / segment_b_dx;
  var segment_a_b  = segment_a.v0.y - ( segment_a_m * segment_a.v0.x );
  var segment_b_b  = segment_b.v0.y - ( segment_b_m * segment_b.v0.x );
  var a_x;
  var a_y;
  var b_x;
  var b_y;

  var range_min_y = ( dvs.min_y < min_y ) ? min_y : dvs.min_y;
  var range_max_y = ( dvs.max_y > max_y ) ? max_y : dvs.max_y; 
  var range_min_x;
  var range_max_x;
 
  for (y=range_min_y;y<=range_max_y;y++) {
    range_min_x = ( dvs.range[y].min_x < min_x ) ? min_x : dvs.range[y].min_x;
    range_max_x = ( dvs.range[y].max_x > max_x ) ? max_x : dvs.range[y].max_x; 
    for (x=range_min_x;x<=range_max_x;x++) {
      test_region = { x:x, y:y };

      if ( ( test_directions & self.kTop ) && self.HasWallTop(x,y) && (test_pt.y > y) ) {
        test_a = self.TestSegmentAgainstTop( segment_a, test_region );
        test_b = self.TestSegmentAgainstTop( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_x         = ( test_a == self.kBothRight ) ? x     : (( y-segment_a_b ) / segment_a_m);
          b_x         = ( test_b == self.kBothLeft  ) ? (x+1) : (( y-segment_b_b ) / segment_b_m);
          result_wall = { v0: { x:a_x, y:y }, v1: { x:b_x, y:y } };
          results.walls.push( result_wall );
        }
      }

      if ( ( test_directions & self.kBottom ) && self.HasWallBottom(x,y) && (test_pt.y < y) ) {
        test_a = self.TestSegmentAgainstBottom( segment_a, test_region );
        test_b = self.TestSegmentAgainstBottom( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_x         = ( test_a == self.kBothRight ) ? (x+1) : (( (y+1)-segment_a_b ) / segment_a_m);
          b_x         = ( test_b == self.kBothLeft  ) ? x     : (( (y+1)-segment_b_b ) / segment_b_m);
          result_wall = { v0: { x:a_x, y:(y+1) }, v1: { x:b_x, y:(y+1) } };
          results.walls.push( result_wall );
        }
      }

      if ( ( test_directions & self.kLeft ) && self.HasWallLeft(x,y) && (test_pt.x > x) ) {
        test_a = self.TestSegmentAgainstLeft( segment_a, test_region );
        test_b = self.TestSegmentAgainstLeft( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_y         = ( test_a == self.kBothRight ) ? (y+1) : (( x * segment_a_m ) + segment_a_b);
          b_y         = ( test_b == self.kBothLeft  ) ? y     : (( x * segment_b_m ) + segment_b_b);
          result_wall = { v0: { x:x, y:a_y }, v1: { x:x, y:b_y } };
          results.walls.push( result_wall );
        }
      }

      if ( ( test_directions & self.kRight ) && self.HasWallRight(x,y) && (test_pt.x < x) ) {
        test_a = self.TestSegmentAgainstRight( segment_a, test_region );
        test_b = self.TestSegmentAgainstRight( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_y         = ( test_a == self.kBothRight ) ? y     : (( (x+1) * segment_a_m ) + segment_a_b);
          b_y         = ( test_b == self.kBothLeft  ) ? (y+1) : (( (x+1) * segment_b_m ) + segment_b_b);
          result_wall = { v0: { x:(x+1), y:a_y }, v1: { x:(x+1), y:b_y } };
          results.walls.push( result_wall );
        }
      }
    }
  }

  if ( test_directions & self.kTop ) {
    for (i=0;i<dvs.portals.top.length;i++) { 
      x           = dvs.portals.top[i].x;
      y           = dvs.portals.top[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) && (test_pt.y > y) ) {
        test_region = { x:x, y:y };
        test_a      = self.TestSegmentAgainstTop( segment_a, test_region );
        test_b      = self.TestSegmentAgainstTop( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_x           = ( test_a == self.kBothRight ) ? x     : (( y-segment_a_b ) / segment_a_m);
          b_x           = ( test_b == self.kBothLeft  ) ? (x+1) : (( y-segment_b_b ) / segment_b_m);
          result_portal = { v0: { x:a_x, y:y }, v1: { x:b_x, y:y } };
          results.portals.push( result_portal );
          self.GetVisibleSegmentsThroughSinglePortal( self.kTop, result_portal, test_pt, results, min_x, min_y, max_x, max_y );

          if ( (test_a == self.kBothRight ) && self.IsCorner(x,y) ) {
            self.AddResultsLocalCorner( test_pt, x, y, results );
          }
          if ( (test_b == self.kBothLeft ) && self.IsCorner(x+1,y) ) {
            self.AddResultsLocalCorner( test_pt, x+1, y, results );
          }
        }
      }
    }
  }

  if ( test_directions & self.kBottom ) {
    for (i=0;i<dvs.portals.bottom.length;i++) { 
      x           = dvs.portals.bottom[i].x;
      y           = dvs.portals.bottom[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) && (test_pt.y < y) ) {
        test_region = { x:x, y:y };
        test_a      = self.TestSegmentAgainstBottom( segment_a, test_region );
        test_b      = self.TestSegmentAgainstBottom( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_x           = ( test_a == self.kBothRight ) ? (x+1) : (( (y+1)-segment_a_b ) / segment_a_m);
          b_x           = ( test_b == self.kBothLeft  ) ? x     : (( (y+1)-segment_b_b ) / segment_b_m);
          result_portal = { v0: { x:a_x, y:(y+1) }, v1: { x:b_x, y:(y+1) } };
          results.portals.push( result_portal );
          self.GetVisibleSegmentsThroughSinglePortal( self.kBottom, result_portal, test_pt, results, min_x, min_y, max_x, max_y );

          if ( (test_a == self.kBothRight ) && self.IsCorner(x+1,y+1) ) {
            self.AddResultsLocalCorner( test_pt, x+1, y+1, results );
          }
          if ( (test_b == self.kBothLeft ) && self.IsCorner(x,y+1) ) {
            self.AddResultsLocalCorner( test_pt, x, y+1, results );
          }
        }
      }
    }
  }

  if ( test_directions & self.kLeft ) {
    for (i=0;i<dvs.portals.left.length;i++) { 
      x           = dvs.portals.left[i].x;
      y           = dvs.portals.left[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) && (test_pt.x > x) ) {
        test_region = { x:x, y:y };
        test_a      = self.TestSegmentAgainstLeft( segment_a, test_region );
        test_b      = self.TestSegmentAgainstLeft( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_y           = ( test_a == self.kBothRight ) ? (y+1) : (( x * segment_a_m ) + segment_a_b);
          b_y           = ( test_b == self.kBothLeft  ) ? y     : (( x * segment_b_m ) + segment_b_b);
          result_portal = { v0: { x:x, y:a_y }, v1: { x:x, y:b_y } };
          results.portals.push( result_portal );
          self.GetVisibleSegmentsThroughSinglePortal( self.kLeft, result_portal, test_pt, results, min_x, min_y, max_x, max_y );

          if ( (test_a == self.kBothRight ) && self.IsCorner(x,y+1) ) {
            self.AddResultsLocalCorner( test_pt, x, y+1, results );
          }
          if ( (test_b == self.kBothLeft ) && self.IsCorner(x,y) ) {
            self.AddResultsLocalCorner( test_pt, x, y, results );
          }
        }
      }
    }
  }

  if ( test_directions & self.kRight ) {
    for (i=0;i<dvs.portals.right.length;i++) { 
      x           = dvs.portals.right[i].x;
      y           = dvs.portals.right[i].y;
      if ( self.IsValueInclusiveRange(x, min_x, max_x) && self.IsValueInclusiveRange(y, min_y, max_y) && (test_pt.x < x) ) {
        test_region = { x:x, y:y };
        test_a      = self.TestSegmentAgainstRight( segment_a, test_region );
        test_b      = self.TestSegmentAgainstRight( segment_b, test_region );
        if (( test_a != self.kBothLeft ) && ( test_b != self.kBothRight )) {
          a_y           = ( test_a == self.kBothRight ) ? y     : (( (x+1) * segment_a_m ) + segment_a_b);
          b_y           = ( test_b == self.kBothLeft  ) ? (y+1) : (( (x+1) * segment_b_m ) + segment_b_b);
          result_portal = { v0: { x:(x+1), y:a_y }, v1: { x:(x+1), y:b_y } };
          results.portals.push( result_portal );
          self.GetVisibleSegmentsThroughSinglePortal( self.kRight, result_portal, test_pt, results, min_x, min_y, max_x, max_y );

          if ( (test_a == self.kBothRight ) && self.IsCorner(x+1,y) ) {
            self.AddResultsLocalCorner( test_pt, x+1, y, results );
          }
          if ( (test_b == self.kBothLeft ) && self.IsCorner(x+1,y+1) ) {
            self.AddResultsLocalCorner( test_pt, x+1, y+1, results );
          }
        }
      }
    }
  } 
} 

GridMap.prototype.GetVisibleThroughPortals = function( dvs, test_x, test_y ) {
  if ( !dvs) {
    return false;
  }

  var self      = this;
  var test_pt   = { x: test_x, y: test_y };
  var results   = { walls: [], segments: [], portals: [], corners: [] };
  var x;
  var y;
  var i;
  var portal_segment;

  // for each portal in the dvs, get the dvs from the region on the other side.
  // eliminate from that set:
  // 1. any regions on the same side as the portal as the test point

  for (i=0;i<dvs.portals.top.length;i++) { 
    x              = dvs.portals.top[i].x;
    y              = dvs.portals.top[i].y;
    portal_segment = { v0: { x:x, y:y }, v1: { x:(x+1), y:y } };
    self.GetVisibleSegmentsThroughSinglePortal( self.kTop, portal_segment, test_pt, results );

    if ( self.IsCorner(x,y) ) {
      self.AddResultsLocalCorner( test_pt, x, y, results );
    }
    if ( self.IsCorner(x+1,y) ) {
      self.AddResultsLocalCorner( test_pt, x+1, y, results );
    }
  }
  for (i=0;i<dvs.portals.bottom.length;i++) { 
    x         = dvs.portals.bottom[i].x;
    y         = dvs.portals.bottom[i].y;
    portal_segment = { v0: { x:(x+1), y:(y+1) }, v1: { x:x, y:(y+1) } };
    self.GetVisibleSegmentsThroughSinglePortal( self.kBottom, portal_segment, test_pt, results );

    if ( self.IsCorner(x+1,y+1) ) {
      self.AddResultsLocalCorner( test_pt, x+1, y+1, results );
    }
    if ( self.IsCorner(x,y+1) ) {
      self.AddResultsLocalCorner( test_pt, x, y+1, results );
    }
  }
  for (i=0;i<dvs.portals.left.length;i++) { 
    x         = dvs.portals.left[i].x;
    y         = dvs.portals.left[i].y;
    portal_segment = { v0: { x:x, y:(y+1) }, v1: { x:x, y:y } };
    self.GetVisibleSegmentsThroughSinglePortal( self.kLeft, portal_segment, test_pt, results );

    if ( self.IsCorner(x,y+1) ) {
      self.AddResultsLocalCorner( test_pt, x, y+1, results );
    }
    if ( self.IsCorner(x,y) ) {
      self.AddResultsLocalCorner( test_pt, x, y, results );
    }
  }
  for (i=0;i<dvs.portals.right.length;i++) { 
    x         = dvs.portals.right[i].x;
    y         = dvs.portals.right[i].y;
    portal_segment = { v0: { x:(x+1), y:y }, v1: { x:(x+1), y:(y+1) } };
    self.GetVisibleSegmentsThroughSinglePortal( self.kRight, portal_segment, test_pt, results );

    if ( self.IsCorner(x+1,y) ) {
      self.AddResultsLocalCorner( test_pt, x+1, y, results );
    }
    if ( self.IsCorner(x+1,y+1) ) {
      self.AddResultsLocalCorner( test_pt, x+1, y+1, results );
    }
  }

  self.ReduceCorners( test_x, test_y, results );

  return results;
}

// Remove corners that don't have line of sight because another corner is along the same line.
GridMap.prototype.ReduceCorners = function( test_x, test_y, results ) {
  function frac_reduce(numerator,denominator){
    var find_gcd = function gcd(a,b){ return b ? find_gcd(b, a%b) : a; };
    var gcd      = find_gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
  }

  var corner_by_slope = { };
  var slope;
  var slope_id;
  var dist_sq;
  var dx;
  var dy;
  var corner;

  for (i=0;i<results.corners.length;i++) {
    dx       = results.corners[i].x-test_x;
    dy       = results.corners[i].y-test_y;
    slope    = frac_reduce( dy, dx );
    slope_id = slope[0] + '/' + slope[1];
    dist_sq  = (dx*dx) + (dy*dy);
    if ((!corner_by_slope[ slope_id ]) || (corner_by_slope[ slope_id ].dist_sq > dist_sq)) {
      corner_by_slope[ slope_id ] = { dist_sq: dist_sq, x: results.corners[i].x, y: results.corners[i].y };
    }
  }

  results.corners = [];
  for (corner in corner_by_slope) {
    results.corners.push( { x: corner_by_slope[corner].x, y: corner_by_slope[corner].y, dist_sq: corner_by_slope[corner].dist_sq  } );
  } 
}

GridMap.prototype.GetDVSBoundaryCorners = function( test_x, test_y, tl_dvs, tr_dvs, bl_dvs, br_dvs ) {
  var self = this;
  var x;
  var y;
  var min_x;
  var min_y;
  var max_x;
  var max_y;
  var min_x_valid = false;
  var min_y_valid = false;
  var max_x_valid = false;
  var max_y_valid = false;
  var boundary_corners = [];

  if ( tl_dvs ) {
    for (x=test_x-1;x>=tl_dvs.range[test_y-1].min_x;x--) {
      if ( self.IsCorner( x, test_y ) ) {
        min_x       = x;
        min_x_valid = !self.HasWallLeft( x, test_y-1 );
        break;
      } 
    }

    for (y=test_y-1;y>=tl_dvs.min_y;y--) {
      if ( self.IsCorner( test_x, y ) ) {
        min_y       = y;
        min_y_valid = !self.HasWallTop( test_x-1, y );
        break;
      } 
    }
  }

  if ( tr_dvs ) {
    for (x=test_x+1;x<=tr_dvs.range[test_y-1].max_x+1;x++) {
      if ( self.IsCorner( x, test_y ) ) {
        max_x       = x;
        max_x_valid = !self.HasWallLeft( x, test_y-1 );
        break;
      } 
    }

    for (y=test_y-1;y>=tr_dvs.min_y;y--) {
      if ( self.IsCorner( test_x, y ) ) {
        if ( ((min_y_valid) && (y > min_y)) || (!min_y_valid) ) {
          min_y       = y;
          min_y_valid = !self.HasWallTop( test_x, y );
          break;
        }
      } 
    }
  }

  if ( bl_dvs ) {
    for (x=test_x-1;x>=bl_dvs.range[test_y].min_x;x--) {
      if ( self.IsCorner( x, test_y ) ) {
        if ( ((min_x_valid) && (x > min_x)) || (!min_x_valid) ) {
          min_x       = x;
          min_x_valid = !self.HasWallLeft( x, test_y );
          break;
        }
      } 
    }

    for (y=test_y+1;y<=bl_dvs.max_y+1;y++) {
      if ( self.IsCorner( test_x, y ) ) {
        max_y       = y;
        max_y_valid = !self.HasWallTop( test_x-1, y );
        break;
      } 
    }
  }

  if ( br_dvs ) {
    for (x=test_x+1;x<=br_dvs.range[test_y].max_x+1;x++) {
      if ( self.IsCorner( x, test_y ) ) {
        if ( ((max_x_valid) && (x < max_x)) || (!max_x_valid) ) {
          max_x       = x;
          max_x_valid = !self.HasWallLeft( x, test_y );
          break;
        }
      } 
    }

    for (y=test_y+1;y<=br_dvs.max_y+1;y++) {
      if ( self.IsCorner( test_x, y ) ) {
        if ( ((max_y_valid) && (y < max_y)) || (!max_y_valid) ) {
          max_y       = y;
          max_y_valid = !self.HasWallTop( test_x, y );
          break;
        }
      } 
    }
  }

  if ( min_x_valid ) {
    boundary_corners.push( {x:min_x, y:test_y} );
  }
  if ( max_x_valid ) {
    boundary_corners.push( {x:max_x, y:test_y} );
  }
  if ( min_y_valid ) {
    boundary_corners.push( {x:test_x, y:min_y} );
  }
  if ( max_y_valid ) { 
    boundary_corners.push( {x:test_x, y:max_y} );
  }

  return boundary_corners;
}
