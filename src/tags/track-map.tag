<track-map>

  <div></div>

  <script>

    this.on('mount', () => {
        GPSTools.Map.create(this.root.querySelector('div'));
        GPSTools.Map.getMap().addControl(new PanelControl({tag: this}));
    });

    switchPanel() {
      // TODO: this should be in a parent callback
      // p.s. but if I know about the callback won't I know about the bool anyway?
      // p.p.s yer i know the callback is supposed to be a contract written by the child
      this.parent.mapIsPanel = !this.parent.mapIsPanel
      this.parent.update()
      GPSTools.Map.updateSize()
    })

    this.on("update", () => {
      GPSTools.Map.updateSize()
      GPSTools.Map.clearLine()
      opts.tracks.forEach(drawTrack)
    })

    function drawTrack(track) {
      GPSTools.Map.drawLine(track.points)
    }

    /**
     * @constructor
     * @extends {ol.control.Control}
     * @param {Object=} opt_options Control options.
     */
    var PanelControl = function(opt_options) {

      var options = opt_options || {};
      var tag = options.tag;

      var getClassName = function(){
        return (tag.isPanel ? "icon-resize-full icon-white" : "icon-resize-small icon-white");
      }

      var button = document.createElement('button');
      var icon = document.createElement('i');
      icon.className = getClassName();
      button.appendChild(icon);

      var handleSwitchPanel = () => {
        tag.switchPanel();
        icon.className = getClassName();
      }

      button.addEventListener('click', handleSwitchPanel, false);
      button.addEventListener('touchstart', handleSwitchPanel, false);

      var element = document.createElement('div');
      element.className = 'panel-control ol-unselectable ol-control';
      element.appendChild(button);

      ol.control.Control.call(this, {
        element: element,
        target: options.target
      });

    };
    ol.inherits(PanelControl, ol.control.Control);
  </script>

  <style scoped>
    :scope > div {
      height: 100%
    }
  </style>

</track-map>
