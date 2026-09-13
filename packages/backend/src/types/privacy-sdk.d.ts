declare module '@zeroproof/privacy-sdk' {
  export const ipfsStorage: any;
  export function generateSolvencyProof(...args: any[]): Promise<any>;
  export function verifySolvencyProof(...args: any[]): Promise<boolean>;
  export function generateComplianceProof(...args: any[]): Promise<any>;
  export function verifyComplianceProof(...args: any[]): Promise<boolean>;
  export function generateMockKYCProviderKey(...args: any[]): Promise<any>;
  export function deriveComplianceStatus(checks: {
    isSolvent?: boolean;
    kycPassed?: boolean;
    amlPassed?: boolean;
  }): 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
  export function stripPrivateFields(value: any): any;
  export function assertNoPrivateFields(value: any, context?: string): void;
}
