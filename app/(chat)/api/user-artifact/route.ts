import { auth } from '@/app/(auth)/auth';
import { getUserArtifact } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:document').toResponse();
  }

  try {
    const userArtifact = await getUserArtifact({ userId: session.user.id });

    if (!userArtifact) {
      return Response.json(null, { status: 200 });
    }

    // Transform the database document to match the expected UserArtifact interface
    const transformedArtifact = {
      id: userArtifact.id,
      title: userArtifact.title,
      kind: userArtifact.kind,
      content: userArtifact.content || '',
      updatedAt: userArtifact.createdAt.toISOString(),
      createdAt: userArtifact.createdAt.toISOString(),
    };

    return Response.json(transformedArtifact, { status: 200 });
  } catch (error) {
    return new ChatSDKError(
      'bad_request:document',
      'Failed to get user artifact',
    ).toResponse();
  }
}
