import { createHttpClient } from '@/shared/infrastructure/http/http-client';
import { iamPorts } from '@/iam/interfaces/composition/iam-container';
import { HttpWorkflowRepository } from '../../infrastructure/adapters/HttpWorkflowRepository';

const http = createHttpClient(() => iamPorts.tokenStorage.read());
export const workflowRepository = new HttpWorkflowRepository(http);

export const workflowPorts = { workflowRepository };
