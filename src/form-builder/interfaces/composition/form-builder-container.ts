import { createHttpClient } from '@/shared/infrastructure/http/http-client';
import { iamPorts } from '@/iam/interfaces/composition/iam-container';
import { HttpFormRepository } from '../../infrastructure/adapters/HttpFormRepository';
import { HttpAiSuggestionService } from '../../infrastructure/adapters/HttpAiSuggestionService';
import { ListFormsUseCase } from '../../application/use-cases/ListFormsUseCase';
import { GetFormUseCase } from '../../application/use-cases/GetFormUseCase';
import { SaveFormUseCase } from '../../application/use-cases/SaveFormUseCase';
import { PublishFormUseCase } from '../../application/use-cases/PublishFormUseCase';
import { DeleteFormUseCase } from '../../application/use-cases/DeleteFormUseCase';
import { SuggestFieldsUseCase } from '../../application/use-cases/SuggestFieldsUseCase';

const http = createHttpClient(() => iamPorts.tokenStorage.read());
const formRepository = new HttpFormRepository(http);
const aiService = new HttpAiSuggestionService(http);

export const listFormsUseCase = new ListFormsUseCase(formRepository);
export const getFormUseCase = new GetFormUseCase(formRepository);
export const saveFormUseCase = new SaveFormUseCase(formRepository);
export const publishFormUseCase = new PublishFormUseCase(formRepository);
export const deleteFormUseCase = new DeleteFormUseCase(formRepository);
export const suggestFieldsUseCase = new SuggestFieldsUseCase(aiService);

export const formBuilderPorts = {
  formRepository,
  aiService,
};
