import * as DomEvents from "content/DomEvents";
import * as Loader from "content/Loader";
import * as Activator from "content/Activator";

if (Activator.isJsonContentType()) {
  DomEvents.afterHeadAvailable(Loader.setupResources);
  DomEvents.afterDocumentLoaded(Loader.loadViewer);
} else {
  Activator.checkActivationSetting()
    .then((forceActivation: boolean) => {
      if (forceActivation) {
        DomEvents.afterDocumentLoaded(Loader.forceSetupAndLoadViewer);
      }
    })
    .catch((reason) => console.error(reason));
}
