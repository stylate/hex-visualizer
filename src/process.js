let audioContext, sourceBuffer, analyser, gainNode, boost, isMuted, source;

// current bug: can't play another song until reset + puse features are implemented

export function audioInit(player) {
    // initialization
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    isMuted = false;
    boost = 0;

    // create js node
    player.crossOrigin = "anonymous";
    source = audioContext.createMediaElementSource(player);
    source.connect(audioContext.destination);
    source.mediaElement.play();
}