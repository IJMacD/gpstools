<track-list>
  <ul id="tracks-list" class="panel">
    <li each={ opts.tracks } class="track" draggable="true"
        style="background-image: url({ getThumb(64) })">
      <p class="track-name">{ name }</p>
      <span class="track-dist">{ distance.toFixed() }</span>
      <span class="track-time" show="{ time }">{ time }</span>
    </li>
    <p show="{ !opts.tracks.length }">No Tracks</p>
  </ul>
</track-list>
