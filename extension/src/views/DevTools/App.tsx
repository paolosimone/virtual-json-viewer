import React, { useState } from "react";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Viewer from "../Viewer/App";

function JsonPicker(props: { onFileRead: (content: string) => void }) {
  // TODO add load button
  // TODO formatting
  const reader = new FileReader();
  reader.addEventListener("load", function () {
    props.onFileRead(reader.result as string);
  });
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;
    if (files?.length) {
      reader.readAsText(files[0]);
    }
  };
  return (
    <Form>
      <Form.Group>
        <Form.File
          id="jsonPicker"
          label="JSON input"
          accept=".json"
          multiple={false}
          onChange={onChange}
        />
      </Form.Group>
    </Form>
  );
}

function App() {
  const [jsonText, setJsonText] = useState("{}");

  return (
    <Container fluid>
      <Row>
        <JsonPicker onFileRead={setJsonText} />
      </Row>
      <Row>
        <Viewer jsonText={jsonText} />
      </Row>
    </Container>
  );
}

export default App;
