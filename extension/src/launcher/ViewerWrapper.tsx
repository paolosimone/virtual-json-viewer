import { App as ViewerApp } from "@/viewer/App";
import { JSX, useState } from "react";

export function ViewerWrapper(): JSX.Element {
  const [jsonText, setJsonText] = useState("");

  if (!jsonText) {
    return (
      <div className="grid h-screen grid-cols-1 place-items-center">
        <JsonPicker onFileRead={setJsonText} />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ViewerApp jsonText={jsonText} />
    </div>
  );
}

type JsonPickerProps = {
  onFileRead: (content: string) => void;
};

function JsonPicker({ onFileRead }: JsonPickerProps): JSX.Element {
  const reader = new FileReader();

  reader.addEventListener("load", function () {
    onFileRead(reader.result as string);
  });

  reader.addEventListener("error", function () {
    alert(`Error reading file: ${reader.error}`);
  });

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;
    if (files?.length) {
      reader.readAsText(files[0]);
    }
  };

  return (
    <form>
      <input
        type="file"
        accept=".json,.jsonl"
        multiple={false}
        onChange={onChange}
      />
    </form>
  );
}
