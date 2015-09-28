<track-map>

  <div class="{ panel: isPanel }"></div>

  <script>
    this.isPanel = true

    this.on('mount', () => {
        GPSTools.Map.create(this.root.querySelector('div'));
        GPSTools.Map.getMap().addControl(new PanelControl({tag: this}));
    });

    switchPanel() {
      this.update({isPanel : !this.isPanel})
      GPSTools.Map.updateSize()
    })

    this.on("update", () => {
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
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      position: fixed;
    }
    :scope > div.panel {
      top: 4em;
      bottom: 20px;
      box-sizing: border-box;
      overflow: hidden;
      position: absolute;
      left: 400px;
      right: 20px;
      transform: translate3d(0,0,0);
    }
  </style>
</track-map>
