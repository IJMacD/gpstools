var FileActions = {
  _fileInput: null,
  pick () {
    if(!FileActions._fileInput){
      FileActions._fileInput = document.createElement('input')
      FileActions._fileInput.type = "file"
      FileActions._fileInput.multiple = true

      FileActions._fileInput.onchange = (e) => {
          timerStart();
          logging(e.target.files.length + " file(s) selected")

          var fileArray = Array.prototype.slice.call(e.target.files)

          FileActions.open(fileArray)
      }
    }

    FileActions._fileInput.click()
  },
  open (files) {
    Promise
      .all(files.map(GPSTools.importFile))
      .then(TrackActions.add)
  }
}
