import { BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
interface UseBrowserMultiFormatReaderOptions {
    hints?: Map<DecodeHintType, any>;
    timeBetweenDecodingAttempts?: number;
}
export declare const useBrowserMultiFormatReader: ({ timeBetweenDecodingAttempts, hints, }?: UseBrowserMultiFormatReaderOptions) => BrowserMultiFormatReader;
export {};
