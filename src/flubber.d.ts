declare module "flubber" {
  export interface InterpolateOptions {
    maxSegmentLength?: number;
    string?: boolean;
    loop?: boolean;
    single?: boolean;
  }
  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions
  ): (t: number) => string;
}
