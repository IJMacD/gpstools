<track-list>
  <ul id="tracks-list">
    <li each={ tracks } class="track" draggable="true"
        style="background-image: url({ getThumb(64) })">
      <p class="track-name">{ name }</p>
      <span class="track-dist">{ distance.toFixed() }</p>
      <span class="track-time" show="{ time }">{ time }</span>
    </li>
  </ul>
</track-list>
