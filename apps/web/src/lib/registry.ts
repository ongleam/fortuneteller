// AI provider 조립(composition root). config(modelConfig 데이터) + clients(gemini provider) 를
// 묶어 myProvider 를 만든다. inner 레이어(config)가 outer(clients)를 모르도록, 조립은 앱이 소유한다.
import { google } from "@fortuneteller/clients/gemini/client";
import { modelConfig } from "@fortuneteller/config/models";
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from "ai";

const getModelProvider = (config: any) => {
  const { provider, model } = config;

  switch (provider) {
    case "google":
      return google(model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

const createModelRegistry = () => {
  const registry: any = {};

  Object.entries(modelConfig).forEach(([key, config]) => {
    const model = getModelProvider(config);

    if (key.includes("reasoning")) {
      registry[key] = wrapLanguageModel({
        model,
        middleware: extractReasoningMiddleware({ tagName: "think" }),
      });
    } else {
      registry[key] = model;
    }
  });
  return registry;
};

const modelRegistry = createModelRegistry();

export const myProvider = customProvider({
  languageModels: modelRegistry,
});
