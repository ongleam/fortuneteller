import { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/infrastructure/db/queries';
import { createServerClient } from '@/lib/infrastructure/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return Response.json('Only one of starting_after or ending_before can be provided!', {
      status: 400,
    });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  try {
    const chats = await getChatsByUserId({
      id: user.id,
      limit,
      startingAfter,
      endingBefore,
    });

    return Response.json(chats);
  } catch (_) {
    return Response.json('Failed to fetch chats!', { status: 500 });
  }
}
