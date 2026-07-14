export type ReaderMode = 'paged' | 'webtoon';

/** Imperative handle shared by PagedView/WebtoonView so ImageReader can jump
 *  to a page when the footer slider is dragged. */
export interface PageViewHandle {
  scrollToIndex: (index: number) => void;
}
