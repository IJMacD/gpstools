<gpstools-app>
  <gpstools-menu />

  <track-map />

  <track-list />

  <track-detail />

  <input type="file" id="files" name="files" multiple onchange="{ fileSelect }"/>

  <script>
    "use strict"

    let fileInput;

    this.on('mount', () => {
      fileInput = document.getElementById('files');
    })

    RiotControl.on('file_open', () => {
      logging('file_open');
      fileInput.click()
    })

    fileSelect (e) {
      timerStart();
      logging(e.target.files.length + " file(s) selected")

      var fileArray = Array.prototype.slice.call(e.target.files)

      Promise.all(fileArray.map(GPSTools.importFile))
        .then(files => {
          files.forEach(track => {
            RiotControl.trigger('track_add', track)
            RiotControl.trigger('current_set', track)
          })
        })

    }
  </script>
</gpstools-app>
