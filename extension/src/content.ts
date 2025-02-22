import * as Activator from "@/content/Activator";
import * as Loader from "@/content/Loader";

if (Activator.isJsonContentType()) {
  Loader.loadIncrementally();
} else {
  Activator.checkActivationSetting()
    .then((forceActivation: boolean) => {
      if (forceActivation) {
        Loader.tryLoadAfterDocumentLoaded();
      }
    })
    .catch((reason) => console.error(reason));
}
