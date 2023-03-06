interface UseTorchOptions {
    resetStream: () => void;
}
export declare const useTorch: ({ resetStream }: UseTorchOptions) => {
    init: (videoTrack: MediaStreamTrack) => void;
    isOn: boolean;
    isAvailable: boolean | null;
    on: () => Promise<void>;
    off: () => Promise<void>;
};
export {};
