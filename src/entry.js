import RiotControl from '../lib/RiotControl'
import TrackStore from './stores/TrackStore'
import './tags/gpstools-app'

RiotControl.addStore(TrackStore);
RiotControl.addStore(ActiveStore);
riot.mount('gpstools-app');
var logging = msg => { console.log((Date.now() - _startTime) + ": " + msg) },
    _startTime = 0,
    timerStart = () => { _startTime = Date.now() }