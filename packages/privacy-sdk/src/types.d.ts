declare module 'snarkjs' {
  export interface Groth16Proof {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  }
  
  export const groth16: {
    fullProve: (
      input: Record<string, any>,
      wasmFile: string,
      zkeyFileName: string
    ) => Promise<{ proof: Groth16Proof; publicSignals: any }>;
    verify: (
      vKey: any,
      publicSignals: any,
      proof: Groth16Proof
    ) => Promise<boolean>;
  };
}

declare module 'circomlibjs' {
  export function buildPoseidon(): Promise<any>;
  export function buildEddsa(): Promise<any>;
}
