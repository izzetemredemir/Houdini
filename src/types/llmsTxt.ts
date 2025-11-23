/**
 * Types for LLMs.txt profile generation
 */

export type ProfileType = "Personal" | "Project" | "DAO";

// Map ProfileType strings to numbers for contract interaction
export const ProfileTypeNumber: Record<ProfileType, number> = {
  Personal: 0,
  Project: 1,
  DAO: 2,
};

export interface LLMsTxtProfile {
  profileType: ProfileType;
  networks: string[];
  identity: {
    website?: string;
    twitter?: string;
    github?: string;
    discord?: string;
  };
  assets: string[];
  content: string;
}
