patch-caching
=============

Demonstration code for article on caching paths

Order of demonstration (interactive steps)
1. Map to display.
   - region hover
2. Find inner corners.
3. Create regions and portals (DVS)
4. Raycast through portals at walls
5. Display solid visible area. Collect corners.
   - Assuming end points of the path aren't line of sight, the closest path will always go through one of these corners.
   - Collect corners as you go through portals.
   - Behind one of the planes that is connected to the portal edge
6. Eliminate corners that aren't interior corners from the test position
7. Merge four regions' visible per corner. Collect visible corners and distances.
8. Visualize corner to corner distance triangular array (sparse)
