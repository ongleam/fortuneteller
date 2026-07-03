import type { chatModels } from "./models";

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<(typeof chatModels)[number]["id"]>;
}

export const entitlementsByUserType: Record<string, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: ["chat-model", "chat-model-reasoning"],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ["chat-model", "chat-model-reasoning"],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
