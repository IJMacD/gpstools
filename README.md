GPSTools
========

Tools for working with GPS files all HTML5 client side! As the description suggests GPSTools can be used for
working with GPS files.

You can use it straight away without reading the rest of this README by visiting this repository's GitHub pages page at http://ijmacd.github.com/gpstools

Import
------

GPSTools can load GPS files of multiple formats including GPX and KML (at the moment) but it is easy to implement new formats. You can load multiple files at once and can even show details on multiple files at the same time.

Display
---------

Once a file is loaded and selected GPSTools shows when the track started and finished, how long it lasted, how far it was in multiple units, average speed and maximum speeds. It also plots the route on a map, shows a graph of speed and elevation and generates a gradient histogram showing the distribution of gradients in the track.

Once a track or multiple tracks are selected you can make the map larger to see the whole thing in glorious fullscreen goodness.

Generate
------------

If the track doesn't have elevation data associated with it, or even erroneous data, GPSTools can fetch and store the correct data from a web service and then plot the graphs as normal.

If the track doesn't have any speed data that too can be generated. Given any two of a start time, end time or duration GPSTools can generate speed data for the track. You also get the choice of grade adjusted pace for a more realistic fit.

Merge
--------

One of the most powerful features of GPSTools is that it can merge two or more tracks together and then treat it just as one of the other tracks. It can determine whether or not the tracks can be merged (one starts in the same place as another finishes) before correctly appending one track to the other.

Export
--------

Once a file has generated tweaked and merged you can the save the file to your computer in any of the import formats and go on to use it just as you would any other GPS file.

FAQ
-----

*   Something you've described doesn't work :( ?

    OK firstly, sorry for making false promises... but it does work for me on
    my browser - Chrome Dev (about version 26 at the moment).
    If you do find something not working then please contact me through Github
    and tell me specifically your problem - or even better fork the repository fix it
    yourself and send a pull request and you'll become a proud contributor.
