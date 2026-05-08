import { createHttpClient } from '@/shared/infrastructure/http/http-client';
import { iamPorts } from '@/iam/interfaces/composition/iam-container';
import { HttpSubmissionRepository } from '../../infrastructure/adapters/HttpSubmissionRepository';

const http = createHttpClient(() => iamPorts.tokenStorage.read());

export const submissionRepository = new HttpSubmissionRepository(http);
