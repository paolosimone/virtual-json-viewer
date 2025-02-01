import * as DomEvents from "content/DomEvents";
import * as Loader from "content/Loader";
import * as Activator from "content/Activator";

if (Activator.isJson()) {
  DomEvents.afterHeadAvailable(Loader.setupResources);
  DomEvents.afterDocumentLoaded(Loader.loadViewer);
} else {
  Activator.checkSettings()
    .then((forceActivation) => {
      if (forceActivation) {
        DomEvents.afterDocumentLoaded(Loader.forceSetupAndLoadViewer);
      }
    })
    .catch((reason) => console.error(reason));
}
