import React, { useEffect, useRef, useState } from "react";
import { init, renderLoop, setAudio, reset } from "./visualizer";
import { audioInit } from "./process";

const player = new Audio();

function App() {
  useEffect(() => {
    window.SC.initialize({
      client_id: process.env.REACT_APP_SOUNDCLOUD_KEY
    });
  }, []);

  const threeRoot = useRef(null);
  useEffect(() => {
    if (threeRoot) {
      reset();
      const renderCanvas = init();
      threeRoot.current.appendChild(renderCanvas);
      renderLoop();
    }
  }, [threeRoot]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);

  async function submitSearch(event) {
    event.preventDefault();
    const tracks = await window.SC.get("/tracks", {
      q: query
    });
    setTracks(tracks);
    console.log(tracks);
  }

  async function playSound(track) {
    player.src = `${track.stream_url}?client_id=${process.env.REACT_APP_SOUNDCLOUD_KEY}`;
    setAudio(player);
    audioInit(player);
    // process audio here
  }

  return (
    <div className="App">
      <div className="three-root" ref={threeRoot} />
      <div className="audio-search">
        <button onClick={() => setSearchOpen(!searchOpen)}>Search</button>
        <div
          className={`search-container ${
            searchOpen ? "search-container-open" : ""
          }`}
        >
          <form onSubmit={submitSearch}>
            <input
              type="text"
              placeholder="Search for songs..."
              onChange={({ target: { value } }) => setQuery(value)}
            />
          </form>
          <div className="results-container">
            {tracks.map(track => (
              <div
                className="result-row"
                id={track.id}
                onClick={() => playSound(track)}
              >
                <img src={track.artwork_url} />
                <div>
                  <p>{track.title}</p>
                  <p className="meta">{track.user.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
