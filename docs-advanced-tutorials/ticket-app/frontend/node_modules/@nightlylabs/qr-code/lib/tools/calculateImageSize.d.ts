interface ImageSizeOptions {
    originalHeight: number;
    originalWidth: number;
    maxHiddenDots: number;
    maxHiddenAxisDots?: number;
    dotSize: number;
}
export interface ImageSizeResult {
    height: number;
    width: number;
    hideYDots: number;
    hideXDots: number;
}
export default function calculateImageSize({ originalHeight, originalWidth, maxHiddenDots, maxHiddenAxisDots, dotSize }: ImageSizeOptions): ImageSizeResult;
export {};
