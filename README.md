dat-graph
=========

a d3js and Angular project

#To run: #

1. clone
2. from the root directory of the repo, execute ```grunt build```
3. run the app out of the dist folder by opening index.html or by hosting the contents of the dist folder in a web server.
4. profit

#TODO:#
1. currently a problem with the way I pull XML elements' attribute KEYS vs attribute PROPERTIES
2. need an algorithmic way to cause conntected graphs to be layed out as linearly as possible. In a perfect world, there would be two nodes and one node would be at the top of the graph and one would be at the bottom, but in general the non-tree graph is more complicated. In any case, the gravity used by the d3js force-connected graph is probably going to need to be handled manually.
