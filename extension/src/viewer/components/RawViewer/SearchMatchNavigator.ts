import { SearchNavigation } from "@/viewer/state";
import { SearchMatchHandler } from "../RenderedText";

export type SearchNavigationCallback = (navigation: SearchNavigation) => void;

export class SearchMatchNavigator {
  private handlers: SearchMatchHandler[] = [];
  private currentIndex: Nullable<number> = null;
  private onNavigation?: SearchNavigationCallback;

  public reset(handlers: SearchMatchHandler[]) {
    this.handlers = handlers;
    this.currentIndex = null;

    // Automatically select the first match if available
    if (this.handlers.length) {
      this.goToIndex(0);
    } else {
      this.notifyNavigation();
    }
  }

  public observeNavigation(callback: SearchNavigationCallback) {
    this.onNavigation = callback;
  }

  public matchesCount() {
    return this.handlers.length;
  }

  public goToPreviousMatch() {
    if (!this.handlers.length) return;
    const previous = (this.currentIndex || this.handlers.length) - 1;
    this.goToIndex(previous);
  }

  public goToNextMatch() {
    if (!this.handlers.length) return;
    const next = ((this.currentIndex ?? -1) + 1) % this.handlers.length;
    this.goToIndex(next);
  }

  private goToIndex(index: number) {
    // Deselect previous match
    if (this.currentIndex !== null) {
      this.handlers[this.currentIndex].setSelected(false);
    }

    // update current index
    this.currentIndex = index;

    // go to the new match
    const handler = this.handlers[index];
    handler.setSelected(true);
    handler.scrollIntoView();

    // notify the change
    this.notifyNavigation();
  }

  private notifyNavigation() {
    if (this.onNavigation) {
      this.onNavigation({
        currentIndex: this.currentIndex,
        totalCount: this.handlers.length,
      });
    }
  }
}
