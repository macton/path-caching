patch-caching
=============

Demonstration code for article on caching paths

Order of demonstration (interactive steps)

1. (path-0.html) Display map. Hover over regions.
2. (path-1.html) Display inner corners. Hover over regions.
3. (path-2.html) Display region DVS
4. (path-3.html) Display region DVS and portals
5. (path-4.html) Display raycasts through portals at walls
6. (path-5.html) Display solid visible area. Collect corners.
   - Assuming end points of the path aren't line of sight, the closest path will always go through one of these corners.
   - Collect corners as you go through portals.
   - Behind one of the planes that is connected to the portal edge
7. (path-6.html) Display merged DVS and facing portals per region that includes corner
8. (path-7.html) Display solid visible area. Collect line of sight corners.
9. Visualize corner to corner distance triangular array (sparse)
