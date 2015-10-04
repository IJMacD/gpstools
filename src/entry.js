import RiotControl from '../lib/RiotControl'
import TrackStore from './stores/TrackStore'
import ActiveStore from './stores/ActiveStore'
import './tags/gpstools-app.tag'

RiotControl.addStore(TrackStore);
RiotControl.addStore(ActiveStore);
riot.mount('gpstools-app');
var logging = msg => { console.log((Date.now() - _startTime) + ": " + msg) },
    _startTime = 0,
    timerStart = () => { _startTime = Date.now() }
