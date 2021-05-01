import React from "react";
import "./App.css";

function App(props: { jsonText: string }) {
  return (
    <div className="App">
      <header className="App-header">
        <p>Json Viewer</p>
      </header>
      <p>{props.jsonText}</p>
    </div>
  );
}

export default App;
