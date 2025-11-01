import { SearchNavigation } from "@/viewer/state";
import { SearchMatchHandler } from "../RenderedText";

export type SearchNavigationCallback = (navigation: SearchNavigation) => void;

export class SearchMatchNavigator {
  private handlers: SearchMatchHandler[] = [];
  private currentIndex: Nullable<number> = null;
  private onNavigation?: SearchNavigationCallback;

  public reset(handlers: SearchMatchHandler[], startingIndex: number) {
    this.handlers = handlers;
    this.currentIndex = null;

    if (this.handlers.length) {
      this.goToIndex(startingIndex);
    } else {
      this.notifyNavigation();
    }
  }

  public observeNavigation(callback: SearchNavigationCallback) {
    this.onNavigation = callback;
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
    // Defensive boundaries check
    index = Math.max(0, Math.min(index, this.handlers.length - 1));

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
